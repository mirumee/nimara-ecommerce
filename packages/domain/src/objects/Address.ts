import { type AllCountryCode } from "../consts";

export type Address = {
  city: string;
  cityArea: string;
  companyName: string;
  country: AllCountryCode;
  countryArea: string;
  firstName: string;
  id: string;
  isDefaultBillingAddress: boolean | null;
  isDefaultShippingAddress: boolean | null;
  lastName: string;
  phone: string | null;
  postalCode: string;
  streetAddress1: string;
  streetAddress2: string;
};

export type CountryOption = { label: string; value: AllCountryCode };
