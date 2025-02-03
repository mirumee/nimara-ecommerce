import { type Stripe } from "stripe";

export const StripeWebhookEvent: Record<
  string,
  Stripe.WebhookEndpointCreateParams.EnabledEvent
> = {
  WEBHOOK_SUCCESS_EVENT: "payment_intent.succeeded",
  WEBHOOK_FAILED_EVENT: "payment_intent.payment_failed",
  WEBHOOK_CANCELED_EVENT: "payment_intent.canceled",
  WEBHOOK_REFUND_EVENT: "charge.refunded",
};

export const StripeMetaKey = {
  SALEOR_ID: "saleor_id",
  ISSUER: "issuer",
  ENVIRONMENT: "environment",
};
