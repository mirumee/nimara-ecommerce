import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import type { FormattedAddress } from "@nimara/foundation/address/types";

export interface ShippingAddressSectionData {
  addressFormRows: readonly AddressFormRow[];
  addresses: FormattedAddress[];
  countries: CountryOption[];
  countryCode: AllCountryCode;
  formattedShippingAddress: string[] | null;
}
