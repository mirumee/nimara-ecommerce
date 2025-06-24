import { type AllCountryCode } from "@nimara/domain/consts";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";

import { getAccessToken } from "@/auth";
import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { addressService } from "@/services/address";
import { paymentService } from "@/services/payment";
import { userService } from "@/services/user";

import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { validateCheckoutStepAction } from "../../actions";
import { Payment } from "./payment";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<{
    country?: AllCountryCode;
    errorCode?: AppErrorCode;
  }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, searchParams, region, checkout, accessToken, storeUrl] =
    await Promise.all([
      props.params,
      props.searchParams,
      getCurrentRegion(),
      getCheckoutOrRedirect(),
      getAccessToken(),
      getStoreUrl(),
    ]);

  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  await validateCheckoutStepAction({ checkout, user, locale, step: "payment" });

  const resultCountries = await addressService.countriesGet({
    channelSlug: region.market.channel,
    locale,
  });

  if (!resultCountries.ok) {
    throw new Error("No countries found for this channel.");
  }

  const { countryCode: defaultCountryCode } = region.market;

  const countryCode = (() => {
    const paramsCountryCode =
      searchParams.country ?? checkout.shippingAddress?.country;

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

  const [resultUserAddresses, resultAddressRows] = await Promise.all([
    userService.addressesGet({
      variables: { accessToken },
      skip: !resultUserGet,
    }),
    addressService.addressFormGetRows({
      countryCode,
    }),
  ]);

  if (!resultAddressRows.ok) {
    throw new Error("No address form rows.");
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
  );
  const sortedAddresses = formattedAddresses
    .filter(({ address: { country } }) =>
      supportedCountryCodesInChannel.includes(country),
    )
    .sort((a, _) => (a.address.isDefaultBillingAddress ? -1 : 0));

  let paymentGatewayCustomer = null;
  let paymentGatewayMethods: PaymentMethod[] = [];

  if (user) {
    const resultPaymentGatewayCustomer = await paymentService.customerGet({
      user,
      channel: region.market.channel,
      environment: clientEnvs.ENVIRONMENT,
      accessToken: serverEnvs.SALEOR_APP_TOKEN,
    });

    if (resultPaymentGatewayCustomer.ok) {
      paymentGatewayCustomer = resultPaymentGatewayCustomer.data;
    }

    if (paymentGatewayCustomer) {
      const resultPaymentGatewayMethods =
        await paymentService.customerPaymentMethodsList({
          customerId: paymentGatewayCustomer.customerId,
        });

      if (resultPaymentGatewayMethods.ok) {
        paymentGatewayMethods = resultPaymentGatewayMethods.data;
      }
    }
  }

  return (
    <>
      <EmailSection checkout={checkout} user={user} />
      <ShippingAddressSection checkout={checkout} locale={locale} />
      <DeliveryMethodSection checkout={checkout} />
      <PaymentSection>
        <Payment
          paymentGatewayCustomer={paymentGatewayCustomer?.customerId}
          paymentGatewayMethods={paymentGatewayMethods}
          errorCode={searchParams?.errorCode}
          storeUrl={storeUrl}
          checkout={checkout}
          addressFormRows={resultAddressRows.data}
          countries={resultCountries.data}
          countryCode={countryCode}
          formattedAddresses={sortedAddresses}
          user={user}
        />
      </PaymentSection>
    </>
  );
}
