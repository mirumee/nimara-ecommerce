import type Stripe from "stripe";

import {
  type PaymentMethodTokenizationResult,
  type StoredPaymentMethodSchema,
  storedPaymentMethodSchema,
} from "@/lib/saleor/payment-method/schema";

import { humanize } from "./util";

/**
 * Only for an intent the storefront already confirmed: `requires_payment_method`
 * means failure here and the opposite on a fresh intent.
 */
export const mapSetupIntentStatusToProcessResult = (
  status: Stripe.SetupIntent.Status,
): PaymentMethodTokenizationResult => {
  switch (status) {
    case "succeeded":
      return "SUCCESSFULLY_TOKENIZED";
    case "processing":
      return "PENDING";
    case "requires_action":
    case "requires_confirmation":
      return "ADDITIONAL_ACTION_REQUIRED";
    default:
      return "FAILED_TO_TOKENIZE";
  }
};

const serializeCard = (
  card: Stripe.PaymentMethod.Card,
): Pick<StoredPaymentMethodSchema, "creditCardInfo" | "name"> => ({
  creditCardInfo: {
    brand: card.brand,
    expMonth: card.exp_month,
    expYear: card.exp_year,
    lastDigits: card.last4,
  },
  name: `${humanize(card.brand)} ${card.last4}`,
});

export const serializeStoredPaymentMethod = ({
  defaultPaymentMethodId,
  paymentMethod,
}: {
  defaultPaymentMethodId: string | null;
  paymentMethod: Stripe.PaymentMethod;
}): StoredPaymentMethodSchema | null => {
  if (paymentMethod.allow_redisplay !== "always") {
    return null;
  }

  const base = {
    data: { isDefault: paymentMethod.id === defaultPaymentMethodId },
    id: paymentMethod.id,
    supportedPaymentFlows: ["INTERACTIVE"] as const,
    type: paymentMethod.type,
  };

  if (paymentMethod.type === "card" && paymentMethod.card) {
    return storedPaymentMethodSchema.parse({
      ...base,
      ...serializeCard(paymentMethod.card),
    });
  }

  if (paymentMethod.type === "paypal" && paymentMethod.paypal) {
    return storedPaymentMethodSchema.parse({
      ...base,
      name: paymentMethod.paypal.payer_email ?? humanize(paymentMethod.type),
    });
  }

  return storedPaymentMethodSchema.parse({
    ...base,
    name: humanize(paymentMethod.type),
  });
};

export const getExpandableId = (
  value: string | { id: string } | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
};

/**
 * Stripe expands the customer on the listed methods, which is where the
 * default method for the customer lives.
 */
export const getDefaultPaymentMethodId = (
  paymentMethods: Stripe.PaymentMethod[],
): string | null => {
  const customer = paymentMethods[0]?.customer;

  if (!customer || typeof customer === "string" || customer.deleted) {
    return null;
  }

  return getExpandableId(customer.invoice_settings?.default_payment_method);
};
