import { type AllCountryCode } from "../consts";

export type AddressType = "SHIPPING" | "BILLING";

export interface AddressCreateInput {
  city: string;
  cityArea: string;
  companyName: string;
  country: AllCountryCode;
  countryArea: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  postalCode: string;
  streetAddress1: string;
  streetAddress2: string;
}

export interface AddressUpdateInput extends AddressCreateInput {
  id: string;
}

export interface Address extends AddressCreateInput, AddressUpdateInput {
  isDefaultBillingAddress: boolean;
  isDefaultShippingAddress: boolean;
}

export type CountryOption = { label: string; value: AllCountryCode };
