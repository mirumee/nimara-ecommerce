export type Address = {
  city: string;
  cityArea: string;
  companyName: string;
  country: CountryDisplay;
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

type CountryDisplay = { code: string; country?: string };
