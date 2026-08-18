import type Stripe from "stripe";

import {
  type PaymentIntent,
  type PaymentMethodDetails,
  type Refund,
  type RefundStatus,
  type StripeNotification,
  type SupportedStripeWebhookEventType,
} from "@/domain/consts";
import { humanize } from "@/lib/util";

/**
 * Resolves the amount a payment intent event is reported with: the captured
 * amount once succeeded, the capturable amount while awaiting capture, and
 * the intent amount for pending/action states.
 */
const getPaymentIntentReportAmount = (intent: Stripe.PaymentIntent) => {
  switch (intent.status) {
    case "requires_capture":
      return intent.amount_capturable;
    case "succeeded":
      return intent.amount_received;
    default:
      return intent.amount;
  }
};

export const toPaymentIntent = (
  intent: Stripe.PaymentIntent,
): PaymentIntent => ({
  id: intent.id,
  status: intent.status,
  amount: intent.amount,
  reportAmount: getPaymentIntentReportAmount(intent),
  currency: intent.currency,
  clientSecret: intent.client_secret,
  created: intent.created,
  lastErrorCode: intent.last_payment_error?.code ?? null,
});

export const toRefund = (refund: Stripe.Refund): Refund => ({
  id: refund.id,
  status: (refund.status as RefundStatus | null) ?? null,
  amount: refund.amount,
  currency: refund.currency,
});

export const extractPaymentMethodDetails = (
  paymentMethod: Stripe.PaymentMethod,
): PaymentMethodDetails => {
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
    other: { name: humanize(paymentMethod.type ?? "Unknown") },
  };
};

export const toNotification = (
  event: Stripe.Event,
  paymentMethodDetails?: PaymentMethodDetails,
): StripeNotification => {
  const object = event.data.object as Stripe.PaymentIntent | Stripe.Refund;

  return {
    id: event.id,
    type: event.type as SupportedStripeWebhookEventType,
    objectId: object.id,
    amount:
      object.object === "payment_intent"
        ? getPaymentIntentReportAmount(object)
        : object.amount,
    currency: object.currency ?? "",
    metadata: object.metadata ?? {},
    paymentMethodDetails,
    // Refund objects have no capture_method.
    isManualCapture:
      "capture_method" in object && object.capture_method === "manual",
    lastErrorCode:
      "last_payment_error" in object
        ? (object.last_payment_error?.code ?? null)
        : null,
    refundStatus:
      "status" in object && !("amount_received" in object)
        ? ((object.status as RefundStatus | null) ?? null)
        : null,
  };
};
