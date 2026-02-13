import { type Locale } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { type User } from "@nimara/domain/objects/User";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { getCurrentRegion } from "@/foundation/regions";
import { getStoreUrl } from "@/foundation/server";
import { getServiceRegistry } from "@/services/registry";

import { type PaymentSectionData } from "../types";

interface GetCheckoutPaymentSectionDataPayload {
  accessToken?: string | null;
  checkout: Checkout;
  country?: AllCountryCode;
  errorCode?: AppErrorCode;
  locale: Locale;
  user: User | null;
}

export const getCheckoutPaymentSectionData = async ({
  accessToken,
  checkout,
  country,
  errorCode,
  locale,
  user,
}: GetCheckoutPaymentSectionDataPayload): Promise<PaymentSectionData> => {
  const services = await getServiceRegistry();
  const [region, addressService, userService, paymentService, storeUrl] =
    await Promise.all([
      getCurrentRegion(),
      services.getAddressService(),
      services.getUserService(),
      services.getPaymentService(),
      getStoreUrl(),
    ]);

  const resultCountries = await addressService.countriesGet({
    channelSlug: region.market.channel,
    locale,
  });

  if (!resultCountries.ok) {
    throw new Error("Failed to fetch the countries list.");
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

  const [resultAddressRows, resultUserAddresses] = await Promise.all([
    addressService.addressFormGetRows({
      countryCode,
    }),
    accessToken
      ? userService.addressesGet({
          variables: { accessToken },
          skip: !user?.id,
        })
      : Promise.resolve(null),
  ]);

  if (!resultAddressRows.ok) {
    throw new Error("No address form rows.");
  }

  const savedAddresses =
    resultUserAddresses && resultUserAddresses.ok
      ? (resultUserAddresses.data ?? [])
      : [];

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

  // TODO(refactor): This address filtering/sorting logic is duplicated in shipping-address section helper.
  const supportedCountryCodesInChannel = resultCountries.data.map(
    ({ value }: CountryOption) => value,
  ) satisfies AllCountryCode[];
  const sortedAddresses = formattedAddresses
    .filter(({ address }) =>
      supportedCountryCodesInChannel.includes(address.country),
    )
    .sort(
      (a, b) =>
        Number(b.address.isDefaultBillingAddress) -
        Number(a.address.isDefaultBillingAddress),
    );

  let paymentGatewayCustomer: string | null = null;
  let paymentGatewayMethods: PaymentMethod[] = [];

  if (user) {
    const resultPaymentGatewayCustomer = await paymentService.customerGet({
      user,
      channel: region.market.channel,
      environment: clientEnvs.ENVIRONMENT,
      accessToken: serverEnvs.SALEOR_APP_TOKEN,
    });

    if (resultPaymentGatewayCustomer.ok) {
      paymentGatewayCustomer = resultPaymentGatewayCustomer.data.customerId;
    }

    if (paymentGatewayCustomer) {
      const resultPaymentGatewayMethods =
        await paymentService.customerPaymentMethodsList({
          customerId: paymentGatewayCustomer,
        });

      if (resultPaymentGatewayMethods.ok) {
        paymentGatewayMethods = resultPaymentGatewayMethods.data;
      }
    }
  }

  return {
    addressFormRows: resultAddressRows.data,
    countries: resultCountries.data,
    countryCode,
    errorCode,
    formattedAddresses: sortedAddresses,
    paymentGatewayCustomer,
    paymentGatewayMethods,
    storeUrl,
  };
};
