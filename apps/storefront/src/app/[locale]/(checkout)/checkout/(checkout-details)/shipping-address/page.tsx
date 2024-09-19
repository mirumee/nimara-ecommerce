import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { CountryCode } from "@nimara/codegen/schema";

import { getAccessToken } from "@/auth";
import { COOKIE_KEY } from "@/config";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { addressService, checkoutService, userService } from "@/services";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressForm } from "./_forms/guest-form";
import { AddressTab } from "./_tabs/address-tab";

export default async function Page({
  searchParams,
}: NextPageProps<{}, { country?: CountryCode }>) {
  const checkoutId = cookies().get(COOKIE_KEY.checkoutId)?.value;
  const accessToken = getAccessToken();

  const region = await getCurrentRegion();

  const marketCountryCode = region.market.countryCode;

  if (!checkoutId) {
    redirect(paths.cart.asPath());
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: marketCountryCode,
  });

  if (!checkout) {
    await deleteCheckoutIdCookie();
    redirect(paths.cart.asPath());
  }

  if (checkout.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const user = await userService.userGet(accessToken);
  const addresses = await userService.addressesGet({
    variables: { accessToken },
    skip: !user,
  });

  const { countries } = await addressService.countriesGet({
    channelSlug: region.market.channel,
  });
  const formattedAddresses = await Promise.all(
    addresses?.map(async (address) => ({
      ...(await addressService.addressFormat({
        variables: { address },
        skip: addresses?.length === 0,
      })),
      address,
    })) ?? [],
  );

  const supportedCountryCodesInChannel = countries?.map(({ code }) => code);
  const sortedAddresses = formattedAddresses
    .filter(({ address: { country } }) =>
      supportedCountryCodesInChannel?.includes(country.code),
    )
    .sort((a, _) => (a.address.isDefaultShippingAddress ? -1 : 0));

  if (!countries) {
    throw new Error("No countries.");
  }

  const countryCode = (() => {
    const defaultCountryCode = marketCountryCode;
    const paramsCountryCode = searchParams.country;

    if (!paramsCountryCode) {
      return defaultCountryCode;
    }
    const isValidCountryCode = countries.some(
      (country) => country.code === paramsCountryCode,
    );

    if (!isValidCountryCode) {
      return defaultCountryCode;
    }

    return paramsCountryCode;
  })() as CountryCode;

  const { addressFormRows } = await addressService.addressFormGetRows({
    countryCode,
  });

  if (!addressFormRows) {
    throw new Error("No address form rows.");
  }

  return (
    <>
      <EmailSection checkout={checkout} user={user} />
      {user?.id ? (
        <AddressTab
          checkout={checkout}
          countryCode={countryCode}
          countries={countries}
          addressFormRows={addressFormRows}
          addresses={sortedAddresses}
        />
      ) : (
        <ShippingAddressForm
          checkout={checkout}
          countryCode={countryCode}
          countries={countries}
          addressFormRows={addressFormRows}
        />
      )}
      <DeliveryMethodSection checkout={checkout} />
      <PaymentSection />
    </>
  );
}
