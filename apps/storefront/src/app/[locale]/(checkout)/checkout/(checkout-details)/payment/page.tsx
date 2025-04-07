import { getLocale } from "next-intl/server";

import { type CountryCode } from "@nimara/codegen/schema";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
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

type SearchParams = Promise<{ country?: CountryCode; errorCode?: string }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const checkout = await getCheckoutOrRedirect();

  if (checkout?.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const accessToken = await getAccessToken();

  const [user, region, locale, storeUrl, searchParams] = await Promise.all([
    userService.userGet(accessToken),
    getCurrentRegion(),
    getLocale(),
    getStoreUrl(),
    props.searchParams,
  ]);

  await validateCheckoutStepAction({ checkout, user, locale, step: "payment" });

  const marketCountryCode = region.market.countryCode;

  const { countries } = await addressService.countriesGet({
    channelSlug: region.market.channel,
  });

  if (!countries) {
    throw new Error("No countries.");
  }

  const countryCode = (() => {
    const defaultCountryCode = marketCountryCode;
    const paramsCountryCode =
      searchParams.country ?? checkout.shippingAddress?.country.code;

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

  const [addresses, { addressFormRows }] = await Promise.all([
    userService.addressesGet({ variables: { accessToken }, skip: !user }),
    addressService.addressFormGetRows({
      countryCode,
    }),
  ]);

  const formattedAddresses = await Promise.all(
    addresses?.map(async (address) => ({
      ...(await addressService.addressFormat({
        variables: { address },
        skip: !addresses.length,
      })),
      address,
    })) ?? [],
  );

  const supportedCountryCodesInChannel = countries?.map(({ code }) => code);
  const sortedAddresses = formattedAddresses
    .filter(({ address: { country } }) =>
      supportedCountryCodesInChannel.includes(country.code),
    )
    .sort((a, _) => (a.address.isDefaultBillingAddress ? -1 : 0));

  if (!addressFormRows) {
    throw new Error("No address form rows.");
  }
  let paymentGatewayCustomer = null;
  let paymentGatewayMethods: PaymentMethod[] = [];

  if (user) {
    paymentGatewayCustomer = await paymentService.customerGet({
      user,
      channel: region.market.channel,
      environment: clientEnvs.ENVIRONMENT,
      accessToken: serverEnvs.SALEOR_APP_TOKEN,
    });

    if (paymentGatewayCustomer) {
      paymentGatewayMethods = await paymentService.customerPaymentMethodsList({
        customerId: paymentGatewayCustomer,
      });
    }
  }

  return (
    <>
      <EmailSection checkout={checkout} user={user} />
      <ShippingAddressSection checkout={checkout} />
      <DeliveryMethodSection checkout={checkout} />
      <PaymentSection>
        <Payment
          paymentGatewayCustomer={paymentGatewayCustomer}
          paymentGatewayMethods={paymentGatewayMethods}
          errorCode={searchParams?.errorCode}
          storeUrl={storeUrl}
          checkout={checkout}
          addressFormRows={addressFormRows as AddressFormRow[]}
          countries={countries}
          countryCode={countryCode}
          formattedAddresses={sortedAddresses}
          user={user}
        />
      </PaymentSection>
    </>
  );
}
