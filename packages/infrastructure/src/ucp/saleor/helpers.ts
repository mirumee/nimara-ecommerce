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
