import type Stripe from "stripe";

export const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2026-01-28.clover";

export const STRIPE_SETUP_USAGE =
  "on_session" satisfies Stripe.SetupIntentCreateParams["usage"];

export const TRANSACTION_ACTION = ["CANCEL", "CHARGE", "REFUND"] as const;
export type TransactionAction = (typeof TRANSACTION_ACTION)[number];

export type TransactionFlowStrategy = "AUTHORIZATION" | "CHARGE";

export const TRANSACTION_EVENT_TYPE = [
  "AUTHORIZATION_ACTION_REQUIRED",
  "AUTHORIZATION_ADJUSTMENT",
  "AUTHORIZATION_FAILURE",
  "AUTHORIZATION_REQUEST",
  "AUTHORIZATION_SUCCESS",
  "CANCEL_FAILURE",
  "CANCEL_REQUEST",
  "CANCEL_SUCCESS",
  "CHARGE_ACTION_REQUIRED",
  "CHARGE_BACK",
  "CHARGE_FAILURE",
  "CHARGE_REQUEST",
  "CHARGE_SUCCESS",
  "INFO",
  "REFUND_FAILURE",
  "REFUND_REQUEST",
  "REFUND_REVERSE",
  "REFUND_SUCCESS",
] as const;

export type TransactionEventType = (typeof TRANSACTION_EVENT_TYPE)[number];

export type PaymentIntentStatus = Stripe.PaymentIntent.Status;

// Normalized Stripe refund returned by the gateway.
export type Refund = {
  amount: number;
  currency: string;
  id: string;
  status: RefundStatus | null;
};

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

// Stripe types `Refund.status` as plain `string | null`; these are the
// documented values.
export type RefundStatus =
  | "canceled"
  | "failed"
  | "pending"
  | "requires_action"
  | "succeeded";

// Payment method details reported to Saleor alongside a transaction event.
export type PaymentMethodDetails =
  | {
      card: {
        brand?: string;
        expMonth?: number;
        expYear?: number;
        lastDigits?: string;
        name: string;
      };
    }
  | { other: { name: string } };

// Normalized Stripe webhook, mapped in the gateway from the raw Stripe event.
export type StripeNotification = {
  amount: number;
  currency: string;
  id: string;
  isManualCapture: boolean;
  lastErrorCode: string | null;
  metadata: Record<string, string>;
  objectId: string;
  paymentMethodDetails?: PaymentMethodDetails;
  refundStatus: RefundStatus | null;
  type: SupportedStripeWebhookEventType;
};

// Normalized payment intent returned by the gateway.
export type PaymentIntent = {
  amount: number;
  clientSecret: string | null;
  created: number;
  currency: string;
  id: string;
  lastErrorCode: string | null;
  reportAmount: number;
  status: PaymentIntentStatus;
};

export const StripeMetaKey = {
  SALEOR_DOMAIN: "saleorDomain",
  ISSUER: "issuer",
  ENVIRONMENT: "environment",
  TRANSACTION_ID: "transactionId",
  CHANNEL_SLUG: "channelSlug",
  SALEOR_USER_ID: "saleorUserId",
} as const;
