import { type AllCountryCode } from "@nimara/domain/consts";

import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { addressService } from "@/services/address";
import { userService } from "@/services/user";

import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { validateCheckoutStepAction } from "../../actions";
import { ShippingAddressForm } from "./_forms/guest-form";
import { AddressTab } from "./_tabs/address-tab";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<{ country?: AllCountryCode }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, searchParams, region, checkout, accessToken] =
    await Promise.all([
      props.params,
      props.searchParams,
      getCurrentRegion(),
      getCheckoutOrRedirect(),
      getAccessToken(),
    ]);

  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  await validateCheckoutStepAction({
    checkout,
    user,
    locale,
    step: "shipping-address",
  });

  const [resultUserAddresses, resultCountries] = await Promise.all([
    userService.addressesGet({
      variables: { accessToken },
      skip: !user,
    }),
    addressService.countriesGet({
      channelSlug: region.market.channel,
      locale,
    }),
  ]);

  if (!resultCountries.ok) {
    throw new Error("No countries.");
  }

  const savedAddresses = resultUserAddresses.data ?? [];
  const formattedAddresses =
    (await Promise.all(
      savedAddresses.map(async (address) => {
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
    )) ?? [];

  const supportedCountryCodesInChannel = resultCountries.data.map(
    ({ value }) => value,
  ) satisfies AllCountryCode[];

  const sortedAddresses = formattedAddresses
    .filter(({ address: { country } }) =>
      supportedCountryCodesInChannel.includes(country),
    )
    .sort((a, _) => (a.address.isDefaultShippingAddress ? -1 : 0));

  const { countryCode: defaultCountryCode } = region.market;
  const countryCode = (() => {
    const paramsCountryCode = searchParams.country;

    if (!paramsCountryCode) {
      return defaultCountryCode;
    }

    const isValidCountryCode = resultCountries.data.some(
      (country) => country.value === paramsCountryCode,
    );

    if (!isValidCountryCode) {
      return defaultCountryCode;
    }

    return paramsCountryCode;
  })() as AllCountryCode;

  const resultAddressRows = await addressService.addressFormGetRows({
    countryCode,
  });

  if (!resultAddressRows.ok) {
    throw new Error("No address form rows.");
  }

  return (
    <>
      <EmailSection checkout={checkout} user={user} />
      {user?.id ? (
        <AddressTab
          checkout={checkout}
          countryCode={countryCode}
          countries={resultCountries.data}
          addressFormRows={resultAddressRows.data}
          addresses={sortedAddresses}
        />
      ) : (
        <ShippingAddressForm
          checkout={checkout}
          countryCode={countryCode}
          countries={resultCountries.data}
          addressFormRows={resultAddressRows.data}
        />
      )}
      <DeliveryMethodSection checkout={checkout} />
      <PaymentSection />
    </>
  );
}
