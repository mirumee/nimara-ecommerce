import { getLocale } from "next-intl/server";

import { type CountryCode } from "@nimara/codegen/schema";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";

import { getAccessToken } from "@/auth";
import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { addressService, paymentService, userService } from "@/services";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { validateCheckoutStepAction } from "../../actions";
import { Payment } from "./payment";

type SearchParams = Promise<{
  country?: CountryCode;
  errorCode?: AppErrorCode;
}>;

export default async function Page(props: { searchParams: SearchParams }) {
  const checkout = await getCheckoutOrRedirect();

  if (checkout?.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const accessToken = await getAccessToken();

  const [resultUserGet, region, locale, storeUrl, searchParams] =
    await Promise.all([
      userService.userGet(accessToken),
      getCurrentRegion(),
      getLocale(),
      getStoreUrl(),
      props.searchParams,
    ]);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  await validateCheckoutStepAction({ checkout, user, locale, step: "payment" });

  const resultCountries = await addressService.countriesGet({
    channelSlug: region.market.channel,
  });

  if (!resultCountries.ok) {
    throw new Error("No countries found for this channel.");
  }

  const { countryCode: defaultCountryCode } = region.market;

  const countryCode = (() => {
    const paramsCountryCode =
      searchParams.country ?? checkout.shippingAddress?.country.code;

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
      supportedCountryCodesInChannel.includes(country.code),
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
      <ShippingAddressSection checkout={checkout} />
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
