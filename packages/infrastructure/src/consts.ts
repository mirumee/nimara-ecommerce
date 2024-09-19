import type { Address } from "@nimara/domain/objects/Address";

export const ADDRESS_CORE_FIELDS: Array<keyof Address> = [
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
] as const;
