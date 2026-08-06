import type Stripe from "stripe";

import {
  type PaymentMethodDetailsInput,
  type TransactionActionEnum,
  type TransactionEventTypeEnum,
  type TransactionFlowStrategyEnum,
} from "@nimara/codegen/schema";

import { CONFIG } from "@/config";
import { all } from "@/lib/misc";
import { type TransactionEventSchema } from "@/lib/saleor/transaction/schema";

import {
  StripeMetaKey,
  type SupportedStripeWebhookEvent,
  type SupportedStripeWebhookEventType,
} from "./const";

type OptionalKeys = Omit<
  typeof StripeMetaKey,
  "ENVIRONMENT" | "ISSUER"
>[keyof Omit<typeof StripeMetaKey, "ENVIRONMENT" | "ISSUER">];

export const isAppEvent = (event: SupportedStripeWebhookEvent) => {
  const issuerMatch =
    event.data.object.metadata?.[StripeMetaKey.ISSUER] === CONFIG.APP_ID;
  const environmentMatch =
    event.data.object.metadata?.[StripeMetaKey.ENVIRONMENT] ===
    CONFIG.ENVIRONMENT;

  return all([issuerMatch, environmentMatch]);
};

export const getGatewayMetadata = (
  metadata: Partial<Record<OptionalKeys, string>>,
) => ({
  [StripeMetaKey.ENVIRONMENT]: CONFIG.ENVIRONMENT,
  [StripeMetaKey.ISSUER]: CONFIG.APP_ID,
  ...metadata,
});

export const mapStatusToActionType = ({
  actionType,
  status,
}: {
  actionType: TransactionActionEnum | TransactionFlowStrategyEnum;
  status: Stripe.PaymentIntent["status"];
}) => {
  const map = {
    processing: `${actionType}_REQUEST`,
    requires_payment_method: `${actionType}_ACTION_REQUIRED`,
    requires_action: `${actionType}_ACTION_REQUIRED`,
    requires_confirmation: `${actionType}_ACTION_REQUIRED`,
    canceled: `${actionType}_FAILURE`,
    succeeded: `${actionType}_SUCCESS`,
    requires_capture: "AUTHORIZATION_SUCCESS",
  } as Record<string, TransactionEventSchema["result"]>;

  const mappedStatus = map[status];

  if (!mappedStatus) {
    throw new Error(`Cannot map ${status} to actionType ${actionType}.`);
  }

  return mappedStatus;
};

type SourceObjectAddress = {
  city: string;
  country: { code: string };
  countryArea: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  postalCode: string;
  streetAddress1: string;
  streetAddress2: string;
};

/**
 * Stripe picks the payment methods it offers by customer country, which it
 * takes from the intent shipping address and only then from the client IP.
 */
export const getIntentShipping = (
  address: SourceObjectAddress | null | undefined,
): Stripe.PaymentIntentCreateParams["shipping"] | undefined => {
  const name = [address?.firstName, address?.lastName]
    .filter(Boolean)
    .join(" ");

  if (!address || !name) {
    return undefined;
  }

  return {
    address: {
      city: address.city,
      country: address.country.code,
      line1: address.streetAddress1,
      line2: address.streetAddress2,
      postal_code: address.postalCode,
      state: address.countryArea,
    },
    name,
    ...(address.phone && { phone: address.phone }),
  };
};

export const humanize = (str: string) =>
  (str.charAt(0).toUpperCase() + str.slice(1))
    .replaceAll("_", " ")
    .replaceAll("-", " ");

export const extractPaymentMethodDetails = (
  paymentMethod: string | Stripe.PaymentMethod | null | undefined,
): PaymentMethodDetailsInput | undefined => {
  if (!paymentMethod || typeof paymentMethod === "string") {
    return undefined;
  }

  if (paymentMethod.type === "card" && paymentMethod.card) {
    const card = paymentMethod.card;

    return {
      card: {
        name: humanize(card.brand ?? "Card"),
        brand: card.brand ?? undefined,
        lastDigits: card.last4 ?? undefined,
        expMonth: card.exp_month ?? undefined,
        expYear: card.exp_year ?? undefined,
      },
    };
  }

  return {
    other: {
      name: humanize(paymentMethod.type ?? "Unknown"),
    },
  };
};

export const fetchPaymentMethodDetails = async (
  api: Stripe,
  paymentMethod: string | Stripe.PaymentMethod | null | undefined,
): Promise<PaymentMethodDetailsInput | undefined> => {
  if (!paymentMethod) {
    return undefined;
  }

  if (typeof paymentMethod === "string") {
    return extractPaymentMethodDetails(
      await api.paymentMethods.retrieve(paymentMethod),
    );
  }

  return extractPaymentMethodDetails(paymentMethod);
};

/**
 * Resolves the amount a payment intent event is reported with: the captured
 * amount once succeeded, the capturable amount while awaiting capture, and
 * the intent amount for pending/action states.
 */
export const getPaymentIntentReportAmount = (intent: Stripe.PaymentIntent) => {
  switch (intent.status) {
    case "requires_capture":
      return intent.amount_capturable;
    case "succeeded":
      return intent.amount_received;
    default:
      return intent.amount;
  }
};

export const getIntentDashboardUrl = ({
  paymentId,
  secretKey,
}: {
  paymentId: string;
  secretKey: string;
}) => {
  const prefix = secretKey.includes("test") ? "test/" : "";

  return `https://dashboard.stripe.com/${prefix}payments/${paymentId}`;
};

const getAvailableActionsForType = (
  eventType: TransactionEventTypeEnum,
): TransactionActionEnum[] => {
  switch (eventType) {
    case "CHARGE_SUCCESS":
      return ["REFUND"];
    case "CHARGE_FAILURE":
    case "AUTHORIZATION_ADJUSTMENT":
      return ["CHARGE", "CANCEL"];
    default:
      return [];
  }
};

const getRefundUpdatedEventType = (
  status: Stripe.Refund["status"],
): TransactionEventTypeEnum | undefined => {
  switch (status) {
    case "succeeded":
      return "REFUND_SUCCESS";
    case "pending":
    case "requires_action":
      return "REFUND_REQUEST";
    case "canceled":
    case "failed":
      return "REFUND_FAILURE";
  }
};

/**
 * Maps a Stripe event to the Saleor transaction event that should be reported
 * as.
 * Returns `null` for event types the app does not handle (e.g. stale
 * subscriptions still configured on the Stripe webhook endpoint) — callers
 * acknowledge those without reporting.
 */
export const mapStripeEventToSaleorEvent = (
  event: SupportedStripeWebhookEvent,
): {
  availableActions: TransactionActionEnum[];
  type: TransactionEventTypeEnum;
} | null => {
  const stripeObject = event.data.object;
  // @ts-expect-error Refund has no capture_method
  const isManualCapture = stripeObject?.capture_method === "manual";

  const eventTypeMapping: Partial<
    Record<SupportedStripeWebhookEventType, TransactionEventTypeEnum>
  > = {
    "payment_intent.succeeded": "CHARGE_SUCCESS",
    "payment_intent.processing": isManualCapture
      ? "AUTHORIZATION_REQUEST"
      : "CHARGE_REQUEST",
    "payment_intent.payment_failed": isManualCapture
      ? "AUTHORIZATION_FAILURE"
      : "CHARGE_FAILURE",
    "payment_intent.canceled": "CANCEL_SUCCESS",
    "payment_intent.amount_capturable_updated": "AUTHORIZATION_ADJUSTMENT",
    "payment_intent.requires_action": isManualCapture
      ? "AUTHORIZATION_ACTION_REQUIRED"
      : "CHARGE_ACTION_REQUIRED",
    "charge.refund.updated": getRefundUpdatedEventType(stripeObject.status),
  };

  const resolvedEventType =
    eventTypeMapping[event.type as SupportedStripeWebhookEventType];

  if (!resolvedEventType) {
    return null;
  }

  const availableActions = getAvailableActionsForType(resolvedEventType);

  return {
    type: resolvedEventType,
    availableActions: availableActions,
  };
};
