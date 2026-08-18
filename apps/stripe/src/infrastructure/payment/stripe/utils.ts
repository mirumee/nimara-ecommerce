import Stripe from "stripe";

import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { type Logger } from "@nimara/infrastructure/logging/types";

type IntentShippingAddress = {
  city: string;
  country: { code: string };
  countryArea: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  postalCode: string;
  streetAddress1: string;
  streetAddress2: string;
};

/**
 * Stripe picks the payment methods it offers by customer country, which it
 * takes from the intent shipping address and only then from the client IP.
 */
export const getIntentShipping = (
  address: IntentShippingAddress | null | undefined,
): Stripe.PaymentIntentCreateParams["shipping"] | undefined => {
  const name = [address?.firstName, address?.lastName]
    .filter(Boolean)
    .join(" ");

  if (!address || !name) {
    return undefined;
  }

  return {
    address: {
      city: address.city,
      country: address.country.code,
      line1: address.streetAddress1,
      line2: address.streetAddress2,
      postal_code: address.postalCode,
      state: address.countryArea,
    },
    name,
    ...(address.phone && { phone: address.phone }),
  };
};

export const withStripeError = async <T>({
  fn,
  logger,
}: {
  fn: () => Promise<T>;
  logger: Logger;
}): AsyncResult<T> => {
  try {
    return ok(await fn());
  } catch (error) {
    if (!(error instanceof Stripe.errors.StripeError)) {
      throw error;
    }

    logger.error("Stripe error occurred.", {
      error: error.message,
      type: error.type,
    });

    const isSignature = error.type === "StripeSignatureVerificationError";

    return err([
      {
        code: "UNKNOWN_ERROR",
        message: error.message,
        context: {
          description: isSignature
            ? "Failed to verify Stripe webhook."
            : "Stripe error occurred.",
        },
        status: isSignature ? 401 : 400,
      },
    ]);
  }
};
