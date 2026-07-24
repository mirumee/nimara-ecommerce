import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type User } from "@nimara/domain/objects/User";
import { addressToSchema } from "@nimara/foundation/address/address";
import type { FormattedAddress } from "@nimara/foundation/address/types";
import { usePathname, useRouter } from "@nimara/i18n/routing";
import { ADDRESS_DEFAULT_VALUES } from "@nimara/infrastructure/consts";

import {
  type BillingAddressPath,
  type BillingAddressValue,
  type PaymentSchema,
  paymentSchema,
} from "@/features/payment/checkout/schema";
import { paths, QUERY_PARAMS } from "@/foundation/routing/paths";

import { type TabName } from "../tabs/address-tab";

type UsePaymentFormProps = {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  defaultPaymentMethod?: string;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
  user: User | null;
};

export const usePaymentForm = ({
  addressFormRows,
  checkout,
  countries,
  countryCode,
  defaultPaymentMethod,
  errorCode,
  formattedAddresses,
  user,
}: UsePaymentFormProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const [addressActiveTab, setAddressActiveTab] = useState<TabName>(
    formattedAddresses.length ? "saved" : "new",
  );
  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const defaultBillingAddress = formattedAddresses.find(
    ({ address }) => address.isDefaultBillingAddress,
  )?.address;
  const formattedToSchemaDefaultBillingAddress = {
    ...ADDRESS_DEFAULT_VALUES,
    ...addressToSchema(
      defaultBillingAddress ?? (ADDRESS_DEFAULT_VALUES as Address),
    ),
    id: defaultBillingAddress?.id,
  };
  const defaultEmptyBillingAddress = {
    ...ADDRESS_DEFAULT_VALUES,
    country: countryCode,
  } as PaymentSchema["billingAddress"];
  const hasDefaultBillingAddress =
    formattedAddresses[0]?.address.isDefaultBillingAddress;
  const supportedCountryCodesInChannel = countries?.map(({ value }) => value);
  const hasDefaultBillingAddressInCurrentChannel =
    supportedCountryCodesInChannel.includes(defaultBillingAddress?.country);
  const saveAddressForFutureUse = !!(user && addressActiveTab === "new");

  const form = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema({ t, addressFormRows })),
    defaultValues: {
      billingAddress: hasDefaultBillingAddress
        ? formattedToSchemaDefaultBillingAddress
        : defaultEmptyBillingAddress,
      sameAsShippingAddress: checkout.isShippingRequired
        ? !hasDefaultBillingAddressInCurrentChannel
        : false,
      saveAddressForFutureUse,
      saveForFutureUse: !!user,
      paymentMethod: defaultPaymentMethod,
    },
  });

  const billingAddressCountry = form.getValues("billingAddress.country");

  const [saveForFutureUse, sameAsShippingAddress, paymentMethod] = form.watch([
    "saveForFutureUse",
    "sameAsShippingAddress",
    "paymentMethod",
  ]);

  useEffect(() => {
    if (errorCode) {
      router.replace(pathname);
    }
  }, [errorCode]);

  useEffect(() => {
    if (sameAsShippingAddress) {
      form.unregister("billingAddress");
    } else if (checkout.billingAddress) {
      const address = addressToSchema(checkout.billingAddress);

      Object.entries(address).forEach(([field, value]) =>
        form.resetField(`billingAddress.${field}` as BillingAddressPath, {
          defaultValue: value as BillingAddressValue,
        }),
      );
    } else if (defaultBillingAddress) {
      form.resetField("billingAddress", {
        defaultValue: formattedToSchemaDefaultBillingAddress,
      });
    } else {
      form.resetField("billingAddress", {
        defaultValue: defaultEmptyBillingAddress,
      });
    }
  }, [sameAsShippingAddress]);

  useEffect(() => {
    if (billingAddressCountry && billingAddressCountry !== countryCode) {
      router.push(
        paths.checkout.asPath({
          query: {
            [QUERY_PARAMS.step]: "payment",
            [QUERY_PARAMS.country]: billingAddressCountry,
          },
        }),
        { scroll: false },
      );
    }
  }, [billingAddressCountry]);

  useEffect(() => {
    setIsCountryChanging(false);
  }, [addressActiveTab]);

  return {
    addressActiveTab,
    form,
    isCountryChanging,
    paymentMethod,
    sameAsShippingAddress,
    saveForFutureUse,
    setAddressActiveTab,
    setIsCountryChanging,
  };
};
