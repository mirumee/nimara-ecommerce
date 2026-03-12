import { type PostalAddress } from "@ucp-js/sdk";

import { type AddressInput } from "@nimara/codegen/schema";

import type { NameFallback } from "./types";

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
