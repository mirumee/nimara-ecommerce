"use client";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";
import type { FormattedAddress } from "@nimara/foundation/address/types";

import { GuestShippingAddressForm } from "./forms/guest-form";
import { AddressTab } from "./tabs/address-tab";

interface ShippingAddressFormProps {
  addressFormRows: readonly AddressFormRow[];
  addresses: FormattedAddress[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  user: User | null;
}

export const ShippingAddressForm = ({
  addressFormRows,
  addresses,
  checkout,
  countries,
  countryCode,
  user,
}: ShippingAddressFormProps) => {
  return user?.id ? (
    <AddressTab
      checkout={checkout}
      countryCode={countryCode}
      countries={countries}
      addressFormRows={addressFormRows}
      addresses={addresses}
    />
  ) : (
    <GuestShippingAddressForm
      checkout={checkout}
      countryCode={countryCode}
      countries={countries}
      addressFormRows={addressFormRows}
    />
  );
};
