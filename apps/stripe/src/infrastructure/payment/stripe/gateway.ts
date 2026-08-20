import Stripe from "stripe";

import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { type Logger } from "@nimara/infrastructure/logging/types";

import {
  type PaymentIntent,
  type Refund,
  STRIPE_SETUP_USAGE,
  type StripeNotification,
} from "@/domain/consts";
import { getStripeApi } from "@/infrastructure/utils";

import {
  extractPaymentMethodDetails,
  toNotification,
  toPaymentIntent,
  toRefund,
} from "./serializers";
import { withStripeError } from "./utils";

type CaptureMethod = "automatic" | "manual";

/**
 * The only place Stripe's SDK is used for payments. Exposes the operations the
 * app needs against domain types; Stripe errors become `Err` results (anything
 * else rethrows to the global handler → 500).
 */
export const stripeGateway = ({
  secretKey,
  logger,
}: {
  logger: Logger;
  secretKey: string;
}) => {
  const stripe = getStripeApi(secretKey);

  return {
    createPaymentIntent: async (opts: {
      amount: number;
      captureMethod: CaptureMethod;
      currency: string;
      customerId?: string | null;
      metadata: Record<string, string>;
      paymentMethodId?: string;
      saveForFutureUse?: boolean;
      sharedPaymentToken?: string;
      shipping?: Stripe.PaymentIntentCreateParams["shipping"];
    }): AsyncResult<PaymentIntent> => {
      const result = await withStripeError({
        logger,
        fn: () =>
          stripe.paymentIntents.create({
            amount: opts.amount,
            automatic_payment_methods: { enabled: true },
            capture_method: opts.captureMethod,
            currency: opts.currency,
            ...(opts.shipping && { shipping: opts.shipping }),
            metadata: opts.metadata,
            ...(opts.customerId && { customer: opts.customerId }),
            ...(opts.paymentMethodId && {
              payment_method: opts.paymentMethodId,
            }),
            ...(opts.saveForFutureUse && {
              setup_future_usage: STRIPE_SETUP_USAGE,
            }),
            /**
             * An agent-granted credential from Stripe's agentic commerce
             * preview, which the agentic checkout flow completes with.
             */
            ...(opts.sharedPaymentToken && {
              shared_payment_token: opts.sharedPaymentToken,
            }),
          }),
      });

      return result.ok ? ok(toPaymentIntent(result.data)) : result;
    },

    updatePaymentIntent: async (opts: {
      amount: number;
      captureMethod: CaptureMethod;
      currency: string;
      id: string;
      metadata: Record<string, string>;
      params?: Record<string, unknown>;
    }): AsyncResult<PaymentIntent> => {
      const result = await withStripeError({
        logger,
        fn: () =>
          stripe.paymentIntents.update(opts.id, {
            ...opts.params,
            amount: opts.amount,
            currency: opts.currency,
            capture_method: opts.captureMethod,
            metadata: opts.metadata,
          }),
      });

      return result.ok ? ok(toPaymentIntent(result.data)) : result;
    },

    capturePaymentIntent: async (opts: {
      amountToCapture: number;
      id: string;
    }): AsyncResult<PaymentIntent> => {
      const result = await withStripeError({
        logger,
        fn: () =>
          stripe.paymentIntents.capture(opts.id, {
            amount_to_capture: opts.amountToCapture,
          }),
      });

      return result.ok ? ok(toPaymentIntent(result.data)) : result;
    },

    cancelPaymentIntent: async (opts: {
      id: string;
    }): AsyncResult<PaymentIntent> => {
      const result = await withStripeError({
        logger,
        fn: () => stripe.paymentIntents.cancel(opts.id),
      });

      return result.ok ? ok(toPaymentIntent(result.data)) : result;
    },

    retrievePaymentIntent: async (opts: {
      id: string;
    }): AsyncResult<PaymentIntent> => {
      const result = await withStripeError({
        logger,
        fn: () => stripe.paymentIntents.retrieve(opts.id),
      });

      return result.ok ? ok(toPaymentIntent(result.data)) : result;
    },

    createRefund: async (opts: {
      amount: number;
      metadata: Record<string, string>;
      paymentIntentId: string;
    }): AsyncResult<Refund> => {
      const result = await withStripeError({
        logger,
        fn: () =>
          stripe.refunds.create({
            payment_intent: opts.paymentIntentId,
            amount: opts.amount,
            metadata: opts.metadata,
          }),
      });

      return result.ok ? ok(toRefund(result.data)) : result;
    },

    /**
     * Resolves the customer a payment method belongs to — `null` when the
     * method does not exist. Used to verify storefront-supplied method ids
     * before paying with them.
     */
    retrievePaymentMethodCustomerId: async (opts: {
      id: string;
    }): AsyncResult<{ customerId: string | null } | null> => {
      const result = await withStripeError({
        logger,
        fn: async () => {
          try {
            const paymentMethod = await stripe.paymentMethods.retrieve(opts.id);
            const customer = paymentMethod.customer;

            return {
              customerId:
                typeof customer === "string"
                  ? customer
                  : (customer?.id ?? null),
            };
          } catch (error) {
            if (
              error instanceof Stripe.errors.StripeInvalidRequestError &&
              error.code === "resource_missing"
            ) {
              return null;
            }

            throw error;
          }
        },
      });

      return result;
    },

    verifyWebhook: async (opts: {
      body: string;
      secret: string;
      signature: string | null;
    }): AsyncResult<StripeNotification> => {
      const result = await withStripeError({
        logger,
        fn: async () => {
          const event = stripe.webhooks.constructEvent(
            opts.body,
            opts.signature ?? "",
            opts.secret,
          );
          const object = event.data.object;
          const paymentMethod =
            "payment_method" in object ? object.payment_method : null;

          if (!paymentMethod) {
            return toNotification(event);
          }

          // Webhook payloads carry the payment method as an id — resolve it
          // so the Saleor report can carry the card/method details.
          const resolved =
            typeof paymentMethod === "string"
              ? await stripe.paymentMethods.retrieve(paymentMethod)
              : paymentMethod;

          return toNotification(event, extractPaymentMethodDetails(resolved));
        },
      });

      return result;
    },
  };
};

export type StripeGateway = ReturnType<typeof stripeGateway>;

export type StripeGatewayFactory = (opts: {
  logger: Logger;
  secretKey: string;
}) => StripeGateway;
