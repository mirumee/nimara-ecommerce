import {
  type CheckoutResponse,
  type LinkElement,
  type PostalAddress,
} from "@ucp-js/sdk";

import { type AddressInput } from "@nimara/codegen/schema";

import type { NameFallback } from "./types";

const EMPTY_CHECKOUT_CANCEL_TIME = 21600; // 6 hours
const EMPTY_ADDRESS: AddressInput = {
  city: "",
  companyName: "",
  country: "US" as const,
  countryArea: "",
  firstName: "",
  lastName: "",
  phone: undefined,
  postalCode: "",
  streetAddress1: "",
  streetAddress2: "",
};

/**
 * Converts UCP address (PostalAddress) to Saleor AddressInput (camelCase).
 * Uses fallbackNames when address omits first_name/last_name (e.g. shipping).
 */
export function toSaleorAddress(
  addr: Partial<PostalAddress> | null,
  fallbackNames?: NameFallback,
): AddressInput {
  if (!addr) {
    return EMPTY_ADDRESS;
  }

  return {
    city: addr.address_locality || "",
    companyName: "",
    country: (addr.address_country || "US") as "US",
    countryArea: addr.address_region || "",
    firstName: addr.first_name || fallbackNames?.first_name || "",
    lastName: addr.last_name || fallbackNames?.last_name || "",
    phone: addr.phone_number ?? undefined,
    postalCode: addr.postal_code || "",
    streetAddress1: addr.street_address || "",
    streetAddress2: "",
  };
}

/**
 * Converts a currency amount to minor currency.
 * Example: 12.99 USD -> 1299
 * @param amount - The amount to convert to minor currency.
 * @param currency - The currency to convert to minor currency.
 * @returns The amount converted to minor currency.
 */
export const toMinorCurrency = (amount: number, currency: string): number => {
  if (currency.toUpperCase() === "JPY") {
    // JPY is a zero-decimal currency, so we don't need to multiply by 100
    return amount;
  }

  return Number((amount * 100).toFixed(0));
};

/**
 * Calculates fulfillment date based on delivery days offset.
 * @param daysOffset - Number of days from now
 * @returns ISO 8601 date string
 */
export const calculateFulfillmentDate = (daysOffset: number): string => {
  const date = new Date();

  date.setDate(date.getDate() + daysOffset);

  return date.toISOString();
};

/**
 * Formats delivery timeframe for display (e.g., "5-7 days").
 */
export const formatDeliveryDays = (
  minDays: number | null,
  maxDays: number | null,
): string => {
  if (minDays === null && maxDays === null) {
    return "";
  }

  if (minDays === maxDays) {
    return `${minDays} days`;
  }

  return `${minDays || 0}-${maxDays || 0} days`;
};

/**
 * AP2 Helpers - Dummy verification for testing
 */

export interface AP2VerificationResult {
  checkout?: CheckoutResponse;
  errors?: string[];
  valid: boolean;
}

/**
 * Dummy AP2 verification - validates merchant_authorization exists
 */
export function verifyMerchantAuthorizationDummy(
  checkout: CheckoutResponse,
): AP2VerificationResult {
  const checkoutAny = checkout as Record<string, unknown>;
  const ap2 = checkoutAny.ap2 as Record<string, unknown> | undefined;

  if (!ap2?.merchant_authorization) {
    return {
      valid: false,
      errors: ["merchant_authorization_missing"],
    };
  }

  return { valid: true };
}

/**
 * Dummy AP2 verification - validates checkout_mandate exists and is valid string
 */
export function verifyCheckoutMandateDummy(
  mandate: string,
  currentCheckout: CheckoutResponse,
): AP2VerificationResult {
  if (!mandate) {
    return {
      valid: false,
      errors: ["mandate_invalid_signature"],
    };
  }

  if (typeof mandate !== "string") {
    return {
      valid: false,
      errors: ["mandate_invalid_signature"],
    };
  }

  return {
    valid: true,
    checkout: currentCheckout as unknown as CheckoutResponse,
  };
}

/**
 * Dummy AP2 verification - validates checkout terms match between current and mandate
 */
export function validateCheckoutTermsDummy(
  currentCheckout: CheckoutResponse,
  mandateCheckout: CheckoutResponse,
): { errors?: string[]; valid: boolean } {
  const errors: string[] = [];

  const currentCheckoutAny = currentCheckout as Record<string, unknown>;
  const mandateCheckoutAny = mandateCheckout as Record<string, unknown>;

  if (currentCheckoutAny.id !== mandateCheckoutAny.id) {
    errors.push("mandate_scope_mismatch");
  }

  const currentTotals = currentCheckoutAny.totals as
    | Array<{ amount: number; type: string }>
    | undefined;
  const mandateTotals = mandateCheckoutAny.totals as
    | Array<{ amount: number; type: string }>
    | undefined;

  const currentTotal = currentTotals?.find((t) => t.type === "total")?.amount;
  const mandateTotal = mandateTotals?.find((t) => t.type === "total")?.amount;

  if (currentTotal !== mandateTotal) {
    errors.push("mandate_scope_mismatch");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Calculates checkout expiration date (RFC 3339).
 * Default TTL: 6 hours from now.
 * @param ttlSeconds - Optional TTL in seconds (default 6 hours = 21600s)
 * @returns RFC 3339 formatted timestamp
 */
export const calculateCheckoutExpiration = (
  ttlSeconds: number = EMPTY_CHECKOUT_CANCEL_TIME,
): string => {
  const expirationDate = new Date(Date.now() + ttlSeconds * 1000);

  return expirationDate.toISOString();
};

/**
 * Generates UCP-compliant well-known links for checkout.
 * Links are required by spec for legal compliance (privacy policy, TOS, etc).
 *
 * @param baseUrl - Base URL for link construction (e.g., "https://example.com")
 * @returns Array of LinkElement with well-known types
 */
export const generateCheckoutLinks = (baseUrl: string): LinkElement[] => {
  return [
    {
      type: "privacy_policy",
      url: `${baseUrl}/privacy-policy`,
      title: "Privacy Policy",
    },
    {
      type: "terms_of_service",
      url: `${baseUrl}/terms-of-service`,
      title: "Terms of Service",
    },
    {
      type: "refund_policy",
      url: `${baseUrl}/refund-policy`,
      title: "Refund Policy",
    },
    {
      type: "shipping_policy",
      url: `${baseUrl}/shipping-policy`,
      title: "Shipping Policy",
    },
  ];
};

/**
 * Generates continue_url for checkout handoff to business UI.
 * Spec: Server-side state approach (recommended) - opaque URL with checkout ID.
 * Can be extended with custom conditions for when to trigger escalation.
 *
 * @param checkoutId - UCP checkout ID
 * @param baseUrl - Business base URL
 * @param conditions - Optional conditions that may trigger continue_url requirement
 * @returns continue_url or undefined if not needed
 *
 * Example conditions you can check:
 * - missingEmail: checkout.email === null
 * - missingBillingAddress: !checkout.billingAddress
 * - missingShippingAddress: !checkout.shippingAddress
 * - missingDeliveryMethod: !checkout.deliveryMethod
 * - customRequirement: your business logic
 */
export const generateContinueUrl = (
  checkoutId: string,
  baseUrl: string,
  conditions?: Record<string, boolean>,
): string | undefined => {
  // If conditions are provided, only generate if any condition is true
  if (conditions) {
    const needsContinueUrl = Object.values(conditions).some((val) => val);

    if (!needsContinueUrl) {
      return undefined;
    }
  }

  // Generate server-side state URL (recommended by spec)
  return `${baseUrl}/checkout/${checkoutId}`;
};
