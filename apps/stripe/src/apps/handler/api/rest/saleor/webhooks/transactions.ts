import { container } from "@/container";
import {
  getIntentDashboardUrl,
  mapStatusToActionType,
} from "@/domain/event-mapping";
import {
  parseTransactionInitializeData,
  type TransactionEventSchema,
} from "@/domain/payment";
import {
  type PaymentGatewayInitializeSessionSubscription,
  type TransactionCancelationRequestedSubscription,
  type TransactionChargeRequestedSubscription,
  type TransactionInitializeSessionSubscription,
  type TransactionProcessSessionSubscription,
  type TransactionRefundRequestedSubscription,
} from "@/graphql/generated/client";
import { getIntentShipping } from "@/infrastructure/payment/stripe/utils";
import { responseError, responseFromErrors } from "@/lib/api/util";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/currency";

import {
  finalizedResponse,
  intentResponse,
  missingSourceObjectResponse,
  sessionMetadata,
  transactionEventResponse,
} from "./helpers";
import { type HandlerContext } from "./types";

export const paymentGatewayInitializeSessionHandler = async (
  context: HandlerContext<PaymentGatewayInitializeSessionSubscription>,
) => {
  const event = context.req.valid("json");
  const result = await container
    .get("appConfigService")
    .getPaymentGatewayConfigForChannel({
      saleorDomain: context.req.valid("header")["saleor-domain"],
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
) => {
  const event = context.req.valid("json");
  const logger = context.get("logger");
  const saleorDomain = context.req.valid("header")["saleor-domain"];
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

  /**
   * Saved payment methods exist only for signed-in shoppers: payments attach
   * to their gateway user (payment history, fraud signals), saved methods
   * are verified against it, and the save wish requires it.
   */
  let customerId: string | null = null;

  if (user) {
    const customerResult = await container
      .get("paymentMethodService")
      .resolveCustomer({ channelSlug, saleorDomain, user });

    if (customerResult.ok) {
      customerId = customerResult.data;
    } else {
      // Failed resolution should not break the checkout.
      logger.warning("Proceeding without a gateway user.", {
        channelSlug,
        errors: customerResult.errors,
        transactionId: event.transaction.id,
        userId: user.id,
      });
    }
  }

  if (data.paymentMethodId) {
    // A saved method without a resolved owner cannot be verified.
    if (!customerId) {
      return failure(
        user
          ? "Could not resolve the customer for this payment."
          : "Saved payment methods require a signed in customer.",
      );
    }

    const paymentMethodResult = await gateway.retrievePaymentMethodCustomerId({
      id: data.paymentMethodId,
    });

    if (!paymentMethodResult.ok) {
      return responseFromErrors(paymentMethodResult.errors);
    }

    if (!paymentMethodResult.data) {
      logger.warning("Payment attempted with an unknown payment method.", {
        channelSlug,
        paymentMethodId: data.paymentMethodId,
        transactionId: event.transaction.id,
        userId: user?.id,
      });

      return failure("Payment method does not exist.");
    }

    if (paymentMethodResult.data.customerId !== customerId) {
      logger.warning("Payment attempted with a foreign payment method.", {
        channelSlug,
        paymentMethodId: data.paymentMethodId,
        transactionId: event.transaction.id,
        userId: user?.id,
      });

      return failure("Payment method does not belong to this customer.");
    }
  }

  // Saving needs a gateway user.
  if (data.saveForFutureUse && !customerId) {
    logger.warning("Ignoring save for future use without a gateway user.", {
      channelSlug,
      transactionId: event.transaction.id,
      userId: user?.id,
    });
  }

  const intent = await gateway.createPaymentIntent({
    amount: getCentsFromAmount(event.sourceObject.total.gross),
    captureMethod: actionType === "CHARGE" ? "automatic" : "manual",
    currency: event.sourceObject.total.gross.currency,
    customerId,
    metadata: sessionMetadata({
      channelSlug,
      extraMetadata: data.metadata,
      saleorDomain,
      transactionId: event.transaction.id,
    }),
    paymentMethodId: data.paymentMethodId,
    saveForFutureUse: customerId ? data.saveForFutureUse : false,
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
) => {
  const event = context.req.valid("json");
  const saleorDomain = context.req.valid("header")["saleor-domain"];
  const channelSlug = event.sourceObject.channel.slug;
  const gatewayResult = await container.get("paymentService")({
    saleorDomain,
    channelSlug,
  });

  if (!gatewayResult.ok) {
    return responseFromErrors(gatewayResult.errors);
  }

  const { config, gateway } = gatewayResult.data;

  // With client data Saleor asks us to update the intent, otherwise just read it.
  const intent = event.data
    ? await gateway.updatePaymentIntent({
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
      })
    : await gateway.retrievePaymentIntent({
        id: event.transaction.pspReference,
      });

  if (!intent.ok) {
    return responseFromErrors(intent.errors);
  }

  return transactionEventResponse({
    data: intentResponse({
      actionType: event.action.actionType,
      config,
      intent: intent.data,
    }),
    logger: context.get("logger"),
    type: "TransactionProcessSession",
  });
};

export const transactionChargeRequestedHandler = async (
  context: HandlerContext<TransactionChargeRequestedSubscription>,
) => {
  const event = context.req.valid("json");

  if (!event.transaction?.sourceObject) {
    return missingSourceObjectResponse({ type: "TransactionChargeRequested" });
  }

  const gatewayResult = await container.get("paymentService")({
    saleorDomain: context.req.valid("header")["saleor-domain"],
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
) => {
  const event = context.req.valid("json");
  const logger = context.get("logger");

  if (!event.transaction?.sourceObject) {
    return missingSourceObjectResponse({
      type: "TransactionCancelationRequested",
    });
  }

  const gatewayResult = await container.get("paymentService")({
    saleorDomain: context.req.valid("header")["saleor-domain"],
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
) => {
  const event = context.req.valid("json");

  if (!event.transaction?.sourceObject) {
    return missingSourceObjectResponse({ type: "TransactionRefundRequested" });
  }

  const saleorDomain = context.req.valid("header")["saleor-domain"];
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
