import { type Locale } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";

import { getCurrentRegion } from "@/foundation/regions";
import { getServiceRegistry } from "@/services/registry";

import { type ShippingAddressSectionData } from "../types";

interface GetCheckoutShippingAddressSectionDataPayload {
  accessToken?: string | null;
  checkout: Checkout;
  country?: AllCountryCode;
  locale: Locale;
  user: User | null;
}

export const getCheckoutShippingAddressSectionData = async ({
  accessToken,
  checkout,
  country,
  locale,
  user,
}: GetCheckoutShippingAddressSectionDataPayload): Promise<ShippingAddressSectionData> => {
  const services = await getServiceRegistry();
  const [region, addressService, userService] = await Promise.all([
    getCurrentRegion(),
    services.getAddressService(),
    services.getUserService(),
  ]);

  const resultCountries = await addressService.countriesGet({
    channelSlug: region.market.channel,
    locale,
  });

  if (!resultCountries.ok) {
    throw new Error("No countries.");
  }

  const { countryCode: defaultCountryCode } = region.market;
  const countryCode = (() => {
    if (!country) {
      return checkout.shippingAddress?.country ?? defaultCountryCode;
    }

    const isValidCountryCode = resultCountries.data.some(
      (countryOption: CountryOption) => countryOption.value === country,
    );

    return isValidCountryCode ? country : defaultCountryCode;
  })() as AllCountryCode;

  const resultAddressRows = await addressService.addressFormGetRows({
    countryCode,
  });

  if (!resultAddressRows.ok) {
    throw new Error("No address form rows.");
  }

  let savedAddresses: Address[] = [];

  if (accessToken) {
    const resultUserAddresses = await userService.addressesGet({
      variables: { accessToken },
      skip: !user?.id,
    });

    if (resultUserAddresses.ok) {
      savedAddresses = resultUserAddresses.data ?? [];
    }
  }

  const formattedAddresses = savedAddresses.length
    ? await Promise.all(
        savedAddresses.map(async (address: Address) => {
          const resultFormatAddress = await addressService.addressFormat({
            variables: { address },
            locale,
          });

          if (!resultFormatAddress.ok) {
            throw new Error("No address format.");
          }

          return {
            ...resultFormatAddress.data,
            address,
          };
        }),
      )
    : [];

  const supportedCountryCodesInChannel = resultCountries.data.map(
    ({ value }: CountryOption) => value,
  ) satisfies AllCountryCode[];

  const addresses = formattedAddresses
    .filter(({ address }) =>
      supportedCountryCodesInChannel.includes(address.country),
    )
    .sort(
      (a, b) =>
        Number(b.address.isDefaultShippingAddress) -
        Number(a.address.isDefaultShippingAddress),
    );

  const resultCheckoutAddressFormatted = checkout.shippingAddress
    ? await addressService.addressFormat({
        variables: { address: checkout.shippingAddress },
        locale,
      })
    : null;

  if (resultCheckoutAddressFormatted && !resultCheckoutAddressFormatted.ok) {
    throw new Error("No address format.");
  }

  return {
    addresses,
    addressFormRows: resultAddressRows.data,
    countries: resultCountries.data,
    countryCode,
    formattedShippingAddress: resultCheckoutAddressFormatted
      ? resultCheckoutAddressFormatted.data.formattedAddress
      : null,
  };
};
