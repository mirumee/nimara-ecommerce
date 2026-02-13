import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import type { FormattedAddress } from "@nimara/foundation/address/types";

export interface PaymentSectionData {
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  countryCode: AllCountryCode;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
  paymentGatewayCustomer: string | null;
  paymentGatewayMethods: PaymentMethod[];
  storeUrl: string;
}
