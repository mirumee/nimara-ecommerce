import { type Stripe } from "stripe";

export const StripeWebhookEvent = {
  PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_INTENT_PROCESSING: "payment_intent.processing",
  PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
  PAYMENT_INTENT_CREATED: "payment_intent.created",
  PAYMENT_INTENT_CANCELED: "payment_intent.canceled",
  PAYMENT_INTENT_AMOUNT_PARTIALLY_FUNDED: "payment_intent.partially_funded",
  PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED:
    "payment_intent.amount_capturable_updated",
  PAYMENT_INTENT_REQUIRES_ACTION: "payment_intent.requires_action",
  CHARGE_REFUNDED: "charge.refunded",
  CHARGE_REFUND_UPDATED: "charge.refund.updated",
} as const satisfies Record<string, Stripe.Event.Type>;

export type SupportedStripeWebhookEventType =
  (typeof StripeWebhookEvent)[keyof typeof StripeWebhookEvent];

export type SupportedStripeWebhookEvent =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PaymentIntentProcessingEvent
  | Stripe.PaymentIntentCanceledEvent
  | Stripe.PaymentIntentPaymentFailedEvent
  | Stripe.PaymentIntentCreatedEvent
  | Stripe.PaymentIntentPartiallyFundedEvent
  | Stripe.PaymentIntentAmountCapturableUpdatedEvent
  | Stripe.PaymentIntentRequiresActionEvent
  | Stripe.ChargeRefundedEvent
  | Stripe.ChargeRefundUpdatedEvent;

export const StripeMetaKey = {
  SALEOR_DOMAIN: "saleorDomain",
  ISSUER: "issuer",
  ENVIRONMENT: "environment",
  TRANSACTION_ID: "transactionId",
  CHANNEL_SLUG: "channelSlug",
} as const;
