import type Stripe from "stripe";

import { humanize } from "@nimara/lib/utils/string";

import {
  type StoredPaymentMethod,
  storedPaymentMethodSchema,
} from "@/domain/payment-method";

import { getExpandableId } from "./utils";

const serializeCard = (
  card: Stripe.PaymentMethod.Card,
): Pick<StoredPaymentMethod, "creditCardInfo" | "name"> => ({
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
}): StoredPaymentMethod | null => {
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
