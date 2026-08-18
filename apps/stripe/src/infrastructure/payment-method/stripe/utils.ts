import Stripe from "stripe";

import { type PaymentMethodTokenizationResult } from "@/domain/payment-method";

export const getExpandableId = (
  value: string | { id: string } | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
};

export const isResourceMissing = (error: unknown): boolean =>
  error instanceof Stripe.errors.StripeInvalidRequestError &&
  error.code === "resource_missing";

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
