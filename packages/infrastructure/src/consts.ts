import type { Address } from "@nimara/domain/objects/Address";

type AddressCoreField = keyof Omit<
  Address,
  "id" | "isDefaultBillingAddress" | "isDefaultShippingAddress"
>;

export const ADDRESS_CORE_FIELDS = [
  "firstName",
  "lastName",
  "companyName",
  "streetAddress1",
  "streetAddress2",
  "city",
  "countryArea",
  "postalCode",
  "phone",
  "country",
] as const satisfies readonly AddressCoreField[];

export const ADDRESS_DEFAULT_VALUES = {
  firstName: "",
  lastName: "",
  companyName: "",
  streetAddress1: "",
  streetAddress2: "",
  city: "",
  countryArea: "",
  postalCode: "",
  phone: "",
  cityArea: "",
  country: "US", // Default to US, can be changed based on context
} as const satisfies Record<AddressCoreField, string>;
