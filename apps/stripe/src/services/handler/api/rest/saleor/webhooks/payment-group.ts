import { type WebhookData } from "@nimara/infrastructure/apps/saleor/schemas";
import { type Logger } from "@nimara/infrastructure/logging/types";
import { responseFromErrors } from "@nimara/lib/hono/api/util";

import { container } from "@/container";
import { type PaymentGatewayConfig } from "@/domain/app-config";
import { type PaymentIntent } from "@/domain/consts";
import { getAmountFromCents, getCentsFromAmount } from "@/domain/currency";
import {
  type PaymentGroupRequest,
  type TransactionEventSchema,
} from "@/domain/payment";
import {
  findGroupShare,
  getGroupMemberRefusal,
  type GroupCheckout,
  type GroupShare,
  sumGroupShares,
  toGroupShareMetadata,
} from "@/domain/payment-group";
import {
  type GroupCheckoutQuery,
  type TransactionInitializeSessionSubscription,
} from "@/graphql/generated/client";
import { type StripeGateway } from "@/infrastructure/payment/stripe/gateway";

import {
  intentResponse,
  sessionMetadata,
  transactionEventResponse,
} from "./helpers";
import { resolvePaymentCustomer } from "./payment-customer";

type InitializeEvent = WebhookData<TransactionInitializeSessionSubscription>;

type LeaderRequest = Extract<PaymentGroupRequest, { role: "leader" }>;

const toGroupCheckout = (
  checkout: NonNullable<GroupCheckoutQuery["checkout"]>,
): GroupCheckout => ({
  authorizeStatus: checkout.authorizeStatus,
  channelSlug: checkout.channel.slug,
  chargeStatus: checkout.chargeStatus,
  currency: checkout.totalPrice.gross.currency,
  email: checkout.email,
  totalCents: getCentsFromAmount(checkout.totalPrice.gross),
  transactions: (checkout.transactions ?? []).map((transaction) => ({
    actionRequiredCents: transaction.events
      .filter(({ type }) => type === "CHARGE_ACTION_REQUIRED")
      .map(({ amount }) => getCentsFromAmount(amount)),
    chargedCents: getCentsFromAmount(transaction.chargedAmount),
    createdByAppId:
      transaction.createdBy && "id" in transaction.createdBy
        ? transaction.createdBy.id
        : null,
    id: transaction.id,
    pspReference: transaction.pspReference,
  })),
  userId: checkout.user?.id ?? null,
});

const getGroupIdempotencyKey = async ({
  customerId,
  paymentMethodId,
  saveForFutureUse,
  shares,
}: {
  customerId: string | null;
  paymentMethodId?: string;
  saveForFutureUse: boolean;
  shares: GroupShare[];
}) => {
  const value = [
    shares
      .map(({ amount, transactionId }) => `${transactionId}|${amount}`)
      .sort()
      .join(","),
    customerId ?? "",
    paymentMethodId ?? "",
    saveForFutureUse ? "save" : "",
  ].join(";");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return `payment-group-${Buffer.from(digest).toString("hex")}`;
};

const leaderInitializeResponse = async ({
  config,
  event,
  gateway,
  leaderCents,
  logger,
  paymentGroup,
  paymentMethodId,
  refuse,
  respond,
  saleorDomain,
  saveForFutureUse,
}: {
  config: PaymentGatewayConfig;
  event: InitializeEvent;
  gateway: StripeGateway;
  leaderCents: number;
  logger: Logger;
  paymentGroup: LeaderRequest;
  paymentMethodId?: string;
  refuse: (message: string) => Response;
  respond: (data: TransactionEventSchema) => Response;
  saleorDomain: string;
  saveForFutureUse?: boolean;
}): Promise<Response> => {
  const checkoutIds = [
    event.sourceObject.id,
    ...paymentGroup.followers.map(({ checkoutId }) => checkoutId),
  ];

  if (new Set(checkoutIds).size !== checkoutIds.length) {
    return refuse("A payment group lists a checkout more than once.");
  }

  const installation = await container
    .get("appConfigService")
    .getBySaleorDomain({ saleorDomain });

  if (!installation.ok) {
    return responseFromErrors(installation.errors);
  }

  const saleorClient = container.get("saleorClient")({
    authToken: installation.data?.authToken,
    saleorDomain,
  });

  const appId = await saleorClient.getAppId();

  if (!appId.ok) {
    return responseFromErrors(appId.errors);
  }

  if (!appId.data) {
    return refuse("The payment application is not active.");
  }

  const checkoutResults = await Promise.all(
    checkoutIds.map((id) => saleorClient.getGroupCheckout(id)),
  );
  const failedResult = checkoutResults.find((result) => !result.ok);

  if (failedResult && !failedResult.ok) {
    return responseFromErrors(failedResult.errors);
  }

  const checkouts = checkoutResults.map((result) =>
    result.ok && result.data ? toGroupCheckout(result.data) : null,
  );
  const [leader, ...followers] = checkouts;

  if (!leader || followers.some((checkout) => !checkout)) {
    return refuse("A payment group checkout does not exist.");
  }

  const refusal =
    getGroupMemberRefusal({ appId: appId.data, checkout: leader, leader }) ??
    paymentGroup.followers
      .map(({ transactionId }, index) =>
        getGroupMemberRefusal({
          appId: appId.data as string,
          checkout: followers[index] as GroupCheckout,
          leader,
          transactionId,
        }),
      )
      .find(Boolean);

  if (refusal) {
    return refuse(refusal);
  }

  const shares: GroupShare[] = [
    { amount: leaderCents, transactionId: event.transaction.id },
    ...paymentGroup.followers.map(({ transactionId }, index) => ({
      amount: (followers[index] as GroupCheckout).totalCents,
      transactionId,
    })),
  ];

  const customer = await resolvePaymentCustomer({
    channelSlug: event.sourceObject.channel.slug,
    gateway,
    logger,
    paymentMethodId,
    saleorDomain,
    saveForFutureUse,
    transactionId: event.transaction.id,
    user: event.sourceObject.user ?? null,
  });

  if (!customer.ok) {
    return "refusal" in customer
      ? refuse(customer.refusal)
      : responseFromErrors(customer.errors);
  }

  const intent = await gateway.createPaymentIntent({
    amount: sumGroupShares(shares),
    captureMethod: "automatic",
    currency: leader.currency,
    customerId: customer.customerId,
    idempotencyKey: await getGroupIdempotencyKey({
      customerId: customer.customerId,
      paymentMethodId,
      saveForFutureUse: customer.saveForFutureUse,
      shares,
    }),
    metadata: {
      ...sessionMetadata({
        channelSlug: event.sourceObject.channel.slug,
        saleorDomain,
        transactionId: event.transaction.id,
      }),
      ...toGroupShareMetadata(shares),
    },
    paymentMethodId,
    saveForFutureUse: customer.saveForFutureUse,
  });

  if (!intent.ok) {
    return responseFromErrors(intent.errors);
  }

  return respond({
    ...intentResponse({ actionType: "CHARGE", config, intent: intent.data }),
    amount: getAmountFromCents({
      amount: leaderCents,
      currency: leader.currency,
    }),
  });
};

/**
 * Several checkouts paid with one PaymentIntent. Followers only register a
 * transaction without a PaymentIntent; the leader creates the shared intent
 * once every follower is registered, so nothing can be paid earlier.
 */
export const paymentGroupInitializeResponse = async ({
  config,
  event,
  gateway,
  logger,
  paymentGroup,
  paymentMethodId,
  saleorDomain,
  saveForFutureUse,
}: {
  config: PaymentGatewayConfig;
  event: InitializeEvent;
  gateway: StripeGateway;
  logger: Logger;
  paymentGroup: PaymentGroupRequest | undefined;
  paymentMethodId?: string;
  saleorDomain: string;
  saveForFutureUse?: boolean;
}): Promise<Response> => {
  const total = event.sourceObject.total.gross;
  const totalCents = getCentsFromAmount(total);
  const amount = getAmountFromCents({
    amount: totalCents,
    currency: total.currency,
  });

  const respond = (data: TransactionEventSchema) =>
    transactionEventResponse({
      data,
      logger,
      type: "TransactionInitializeSession",
    });

  const refuse = (message: string) => {
    logger.warning("Group payment refused.", {
      message,
      saleorDomain,
      transactionId: event.transaction.id,
    });

    return respond({
      amount,
      message,
      result: `${event.action.actionType}_FAILURE`,
    });
  };

  if (!paymentGroup) {
    return refuse("Invalid payment group.");
  }

  if (event.action.actionType !== "CHARGE") {
    return refuse("Group payments support charge only.");
  }

  if (
    event.action.currency !== total.currency ||
    getCentsFromAmount(event.action) !== totalCents
  ) {
    return refuse("Payment amount does not match the checkout total.");
  }

  if (paymentGroup.role === "leader") {
    return leaderInitializeResponse({
      config,
      event,
      gateway,
      leaderCents: totalCents,
      logger,
      paymentGroup,
      paymentMethodId,
      refuse,
      respond,
      saleorDomain,
      saveForFutureUse,
    });
  }

  return respond({ amount, result: "CHARGE_ACTION_REQUIRED" });
};

export const paymentGroupProcessResponse = ({
  actionAmount,
  config,
  intent,
  transactionId,
}: {
  actionAmount: string;
  config: PaymentGatewayConfig;
  intent: PaymentIntent;
  transactionId: string;
}): TransactionEventSchema => {
  const share = findGroupShare({ metadata: intent.metadata, transactionId });

  if (!share) {
    return { amount: actionAmount, result: "CHARGE_ACTION_REQUIRED" };
  }

  return {
    ...intentResponse({ actionType: "CHARGE", config, intent }),
    amount: getAmountFromCents({
      amount: share.amount,
      currency: intent.currency,
    }),
  };
};
