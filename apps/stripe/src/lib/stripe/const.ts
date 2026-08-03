import { type Stripe } from "stripe";

export const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2026-01-28.clover";

export const StripeWebhookEvent = {
  PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_INTENT_PROCESSING: "payment_intent.processing",
  PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
  PAYMENT_INTENT_CANCELED: "payment_intent.canceled",
  PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED:
    "payment_intent.amount_capturable_updated",
  PAYMENT_INTENT_REQUIRES_ACTION: "payment_intent.requires_action",
  CHARGE_REFUND_UPDATED: "charge.refund.updated",
} as const satisfies Record<string, Stripe.Event.Type>;

export type SupportedStripeWebhookEventType =
  (typeof StripeWebhookEvent)[keyof typeof StripeWebhookEvent];

export type SupportedStripeWebhookEvent =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PaymentIntentProcessingEvent
  | Stripe.PaymentIntentCanceledEvent
  | Stripe.PaymentIntentPaymentFailedEvent
  | Stripe.PaymentIntentAmountCapturableUpdatedEvent
  | Stripe.PaymentIntentRequiresActionEvent
  | Stripe.ChargeRefundUpdatedEvent;

/**
 * Saved methods are charged with the shopper present in the storefront, never
 * unattended, so setup intents are created for on-session reuse.
 */
export const STRIPE_SETUP_USAGE =
  "on_session" satisfies Stripe.SetupIntentCreateParams["usage"];

export const StripeMetaKey = {
  SALEOR_DOMAIN: "saleorDomain",
  ISSUER: "issuer",
  ENVIRONMENT: "environment",
  TRANSACTION_ID: "transactionId",
  CHANNEL_SLUG: "channelSlug",
  SALEOR_USER_ID: "saleorUserId",
} as const;
