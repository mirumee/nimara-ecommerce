import { getLocale } from "next-intl/server";

import type { CountryCode } from "@nimara/codegen/schema";

import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { getCurrentRegion } from "@/regions/server";
import { addressService, userService } from "@/services";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { validateCheckoutStepAction } from "../../actions";
import { ShippingAddressForm } from "./_forms/guest-form";
import { AddressTab } from "./_tabs/address-tab";

type SearchParams = Promise<{ country?: CountryCode }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const checkout = await getCheckoutOrRedirect();

  if (checkout.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const accessToken = await getAccessToken();
  const [searchParams, region, locale, resultUserGet] = await Promise.all([
    props.searchParams,
    getCurrentRegion(),
    getLocale(),
    userService.userGet(accessToken),
  ]);

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
    ({ code }) => code,
  );
  const sortedAddresses = formattedAddresses
    .filter(({ address: { country } }) =>
      supportedCountryCodesInChannel?.includes(country.code),
    )
    .sort((a, _) => (a.address.isDefaultShippingAddress ? -1 : 0));

  const { countryCode: defaultCountryCode } = region.market;
  const countryCode = (() => {
    const paramsCountryCode = searchParams.country;

    if (!paramsCountryCode) {
      return defaultCountryCode;
    }

    const isValidCountryCode = resultCountries.data.some(
      (country) => country.code === paramsCountryCode,
    );

    if (!isValidCountryCode) {
      return defaultCountryCode;
    }

    return paramsCountryCode;
  })() as CountryCode;

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
