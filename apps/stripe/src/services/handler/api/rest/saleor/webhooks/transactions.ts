import { responseError, responseFromErrors } from "@nimara/lib/hono/api/util";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { type SaleorTenant } from "@nimara/lib/saleor/tenant";

import { container } from "@/container";
import { getAmountFromCents, getCentsFromAmount } from "@/domain/currency";
import {
  getIntentDashboardUrl,
  mapStatusToActionType,
} from "@/domain/event-mapping";
import {
  parseTransactionInitializeData,
  requestsPaymentGroup,
  type TransactionEventSchema,
} from "@/domain/payment";
import { isPaymentGroup } from "@/domain/payment-group";
import {
  type PaymentGatewayInitializeSessionSubscription,
  type TransactionCancelationRequestedSubscription,
  type TransactionChargeRequestedSubscription,
  type TransactionInitializeSessionSubscription,
  type TransactionProcessSessionSubscription,
  type TransactionRefundRequestedSubscription,
} from "@/graphql/generated/client";
import { getIntentShipping } from "@/infrastructure/payment/stripe/utils";

import {
  finalizedResponse,
  intentResponse,
  missingSourceObjectResponse,
  sessionMetadata,
  transactionEventResponse,
} from "./helpers";
import { resolvePaymentCustomer } from "./payment-customer";
import {
  paymentGroupInitializeResponse,
  paymentGroupProcessResponse,
} from "./payment-group";

export const paymentGatewayInitializeSessionHandler = async (
  context: HandlerContext<PaymentGatewayInitializeSessionSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");
  const result = await container
    .get("appConfigService")
    .getPaymentGatewayConfigForChannel({
      saleorDomain,
      channelSlug: event.sourceObject.channel.slug,
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  if (!result.data.publicKey) {
    return responseError({
      description: "Missing publishable key for channel.",
      errors: [{ message: "The channel has no publishable key set." }],
      status: 422,
    });
  }

  return transactionEventResponse({
    data: { data: { publishableKey: result.data.publicKey } },
    logger: context.get("logger"),
    type: "PaymentGatewayInitializeSession",
  });
};

export const transactionInitializeSessionHandler = async (
  context: HandlerContext<TransactionInitializeSessionSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");
  const logger = context.get("logger");
  const channelSlug = event.sourceObject.channel.slug;
  const { actionType } = event.action;
  const gatewayResult = await container.get("paymentService")({
    saleorDomain,
    channelSlug,
  });

  if (!gatewayResult.ok) {
    return responseFromErrors(gatewayResult.errors);
  }

  const { config, gateway } = gatewayResult.data;
  const data = parseTransactionInitializeData(event.data);

  // Marketplace: one payment covers a checkout per vendor.
  if (requestsPaymentGroup(event.data)) {
    return paymentGroupInitializeResponse({
      config,
      event,
      gateway,
      logger,
      paymentGroup: data.paymentGroup,
      saveForFutureUse: data.saveForFutureUse,
      saleorDomain,
    });
  }

  const user = event.sourceObject.user;
  const amount = getAmountFromCents(event.sourceObject.total.gross);

  /**
   * Reports a refused payment as a transaction event rather than an error
   * response. A synchronous payment webhook that answers non-2xx reads as a
   * delivery problem, which leaves the transaction in its previous state and
   * tells the shopper nothing.
   */
  const failure = (message: string): Response =>
    transactionEventResponse({
      data: { amount, message, result: `${actionType}_FAILURE` },
      logger,
      type: "TransactionInitializeSession",
    });

  const customer = await resolvePaymentCustomer({
    channelSlug,
    gateway,
    logger,
    paymentMethodId: data.paymentMethodId,
    saleorDomain,
    saveForFutureUse: data.saveForFutureUse,
    transactionId: event.transaction.id,
    user,
  });

  if (!customer.ok) {
    return "refusal" in customer
      ? failure(customer.refusal)
      : responseFromErrors(customer.errors);
  }

  const intent = await gateway.createPaymentIntent({
    amount: getCentsFromAmount(event.sourceObject.total.gross),
    captureMethod: actionType === "CHARGE" ? "automatic" : "manual",
    currency: event.sourceObject.total.gross.currency,
    customerId: customer.customerId,
    metadata: sessionMetadata({
      channelSlug,
      extraMetadata: data.metadata,
      saleorDomain,
      transactionId: event.transaction.id,
    }),
    paymentMethodId: data.paymentMethodId,
    saveForFutureUse: customer.saveForFutureUse,
    sharedPaymentToken: data.sharedPaymentToken,
    shipping: getIntentShipping(event.sourceObject.shippingAddress),
  });

  if (!intent.ok) {
    return responseFromErrors(intent.errors);
  }

  return transactionEventResponse({
    data: intentResponse({
      actionType,
      config,
      intent: intent.data,
    }),
    logger,
    type: "TransactionInitializeSession",
  });
};

export const transactionProcessSessionHandler = async (
  context: HandlerContext<TransactionProcessSessionSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");

  if (!event.transaction.pspReference) {
    return transactionEventResponse({
      data: {
        amount: getAmountFromCents({
          amount: getCentsFromAmount(event.action),
          currency: event.action.currency,
        }),
        result: `${event.action.actionType}_ACTION_REQUIRED`,
      },
      logger: context.get("logger"),
      type: "TransactionProcessSession",
    });
  }

  const channelSlug = event.sourceObject.channel.slug;
  const gatewayResult = await container.get("paymentService")({
    saleorDomain,
    channelSlug,
  });

  if (!gatewayResult.ok) {
    return responseFromErrors(gatewayResult.errors);
  }

  const { config, gateway } = gatewayResult.data;

  const retrievedIntent = await gateway.retrievePaymentIntent({
    id: event.transaction.pspReference,
  });

  if (!retrievedIntent.ok) {
    return responseFromErrors(retrievedIntent.errors);
  }

  if (isPaymentGroup(retrievedIntent.data.metadata)) {
    return transactionEventResponse({
      data: paymentGroupProcessResponse({
        actionAmount: getAmountFromCents({
          amount: getCentsFromAmount(event.action),
          currency: event.action.currency,
        }),
        config,
        intent: retrievedIntent.data,
        transactionId: event.transaction.id,
      }),
      logger: context.get("logger"),
      type: "TransactionProcessSession",
    });
  }

  let intent = retrievedIntent.data;

  // With client data Saleor asks us to update the intent, otherwise just read it.
  if (event.data) {
    const updatedIntent = await gateway.updatePaymentIntent({
      id: event.transaction.pspReference,
      params: event.data as Record<string, unknown>,
      amount: getCentsFromAmount(event.sourceObject.total.gross),
      currency: event.sourceObject.total.gross.currency,
      captureMethod:
        event.action.actionType === "CHARGE" ? "automatic" : "manual",
      metadata: sessionMetadata({
        channelSlug,
        extraMetadata: (event.data as { metadata?: Record<string, string> })
          ?.metadata,
        saleorDomain,
        transactionId: event.transaction.id,
      }),
    });

    if (!updatedIntent.ok) {
      return responseFromErrors(updatedIntent.errors);
    }

    intent = updatedIntent.data;
  }

  return transactionEventResponse({
    data: intentResponse({
      actionType: event.action.actionType,
      config,
      intent,
    }),
    logger: context.get("logger"),
    type: "TransactionProcessSession",
  });
};

export const transactionChargeRequestedHandler = async (
  context: HandlerContext<TransactionChargeRequestedSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");

  if (!event.transaction?.sourceObject) {
    return missingSourceObjectResponse({ type: "TransactionChargeRequested" });
  }

  const gatewayResult = await container.get("paymentService")({
    saleorDomain,
    channelSlug: event.transaction.sourceObject.channel.slug,
  });

  if (!gatewayResult.ok) {
    return responseFromErrors(gatewayResult.errors);
  }

  const { config, gateway } = gatewayResult.data;

  const intent = await gateway.capturePaymentIntent({
    id: event.transaction.pspReference,
    amountToCapture: getCentsFromAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    }),
  });

  if (!intent.ok) {
    return responseFromErrors(intent.errors);
  }

  const result = mapStatusToActionType({
    actionType: event.action.actionType,
    status: intent.data.status,
  });

  return transactionEventResponse({
    data: ["CHARGE_SUCCESS", "CHARGE_FAILURE"].includes(result ?? "")
      ? {
          pspReference: intent.data.id,
          result,
          /**
           * `reportAmount` — after a partial capture the intent keeps the
           * original total in `amount`, and the async
           * `payment_intent.succeeded` report must match this amount for
           * Saleor to deduplicate both reports.
           */
          amount: getAmountFromCents({
            currency: intent.data.currency,
            amount: intent.data.reportAmount,
          }),
          externalUrl: getIntentDashboardUrl({
            paymentId: intent.data.id,
            secretKey: config.secretKey,
          }),
        }
      : { pspReference: intent.data.id },
    logger: context.get("logger"),
    type: "TransactionChargeRequested",
  });
};

export const transactionCancelationRequestedHandler = async (
  context: HandlerContext<TransactionCancelationRequestedSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");
  const logger = context.get("logger");

  if (!event.transaction?.sourceObject) {
    return missingSourceObjectResponse({
      type: "TransactionCancelationRequested",
    });
  }

  const gatewayResult = await container.get("paymentService")({
    saleorDomain,
    channelSlug: event.transaction.sourceObject.channel.slug,
  });

  if (!gatewayResult.ok) {
    return responseFromErrors(gatewayResult.errors);
  }

  const { config, gateway } = gatewayResult.data;
  const intent = await gateway.cancelPaymentIntent({
    id: event.transaction.pspReference,
  });

  /**
   * A refused cancelation is reported as a failed transaction event, not an
   * error response — Saleor keeps the transaction actionable.
   */
  if (!intent.ok) {
    logger.error("Failed to cancel the payment intent.", {
      pspReference: event.transaction.pspReference,
      errors: intent.errors,
    });

    return transactionEventResponse({
      data: {
        pspReference: event.transaction.pspReference,
        result: "CANCEL_FAILURE",
        message: intent.errors[0]?.message,
      },
      logger,
      type: "TransactionCancelationRequested",
    });
  }

  return transactionEventResponse({
    data:
      intent.data.status === "canceled"
        ? finalizedResponse({
            config,
            intent: intent.data,
            result: "CANCEL_SUCCESS",
          })
        : { pspReference: intent.data.id },
    logger,
    type: "TransactionCancelationRequested",
  });
};

export const transactionRefundRequestedHandler = async (
  context: HandlerContext<TransactionRefundRequestedSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const event = context.req.valid("json");

  if (!event.transaction?.sourceObject) {
    return missingSourceObjectResponse({ type: "TransactionRefundRequested" });
  }
  const channelSlug = event.transaction.sourceObject.channel.slug;
  const gatewayResult = await container.get("paymentService")({
    saleorDomain,
    channelSlug,
  });

  if (!gatewayResult.ok) {
    return responseFromErrors(gatewayResult.errors);
  }

  const { config, gateway } = gatewayResult.data;

  const refund = await gateway.createRefund({
    paymentIntentId: event.transaction.pspReference,
    amount: getCentsFromAmount({
      amount: event.action.amount,
      currency: event.action.currency,
    }),
    metadata: sessionMetadata({
      channelSlug,
      saleorDomain,
      transactionId: event.transaction.id,
    }),
  });

  if (!refund.ok) {
    return responseFromErrors(refund.errors);
  }

  const data: TransactionEventSchema =
    refund.data.status === "succeeded"
      ? {
          pspReference: refund.data.id,
          result: "REFUND_SUCCESS",
          amount: getAmountFromCents({
            currency: refund.data.currency,
            amount: refund.data.amount,
          }),
          externalUrl: getIntentDashboardUrl({
            paymentId: refund.data.id,
            secretKey: config.secretKey,
          }),
        }
      : { pspReference: refund.data.id };

  return transactionEventResponse({
    data,
    logger: context.get("logger"),
    type: "TransactionRefundRequested",
  });
};
