import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type User } from "@nimara/domain/objects/User";
import type { FormattedAddress } from "@nimara/foundation/address/types";

export type CommonPaymentProps = {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
  storeUrl: string;
  user: User | null;
};
