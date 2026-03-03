"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { schemaToAddress } from "@nimara/foundation/address/address";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import {
  type AddressSchema,
  addressSchema,
} from "@nimara/foundation/address/address-form/schema";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { updateCheckoutAddressAction } from "@/foundation/checkout/actions/update-checkout-address-action";
import { isGlobalError } from "@/foundation/errors/errors";
import { paths } from "@/foundation/routing/paths";
import { useRouterWithState } from "@/foundation/use-router-with-state";

import { getAddressFormDefaultValues } from "../helpers/get-address-form-default-values";

interface GuestShippingAddressFormProps {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
}

export const GuestShippingAddressForm = ({
  checkout,
  countries,
  addressFormRows,
  countryCode,
}: GuestShippingAddressFormProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isCountryChanging, setIsCountryChanging] = useState(false);
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema({ addressFormRows, t })),
    defaultValues: getAddressFormDefaultValues({
      address: checkout.shippingAddress,
      countryCode,
    }),
  });

  const canProceed =
    !form.formState.isSubmitting && !isCountryChanging && !isRedirecting;

  const handleSubmit = async (input: AddressSchema) => {
    const result = await updateCheckoutAddressAction({
      id: checkout.id,
      address: schemaToAddress(input),
      type: "SHIPPING",
    });

    if (result.ok) {
      push(paths.checkout.asPath({ query: { step: "delivery-method" } }));

      return;
    }

    result.errors.map(({ field, code }) => {
      if (isGlobalError(field)) {
        toast({
          variant: "destructive",
          description: t(`errors.${code}`),
          title: "Error",
        });
      } else {
        form.setError(field as keyof AddressSchema, {
          message: t(`errors.${code}`),
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-6"
        noValidate
      >
        <AddressForm
          addressFormRows={addressFormRows}
          countries={countries}
          onCountryChange={setIsCountryChanging}
        />
        <Button
          className="ml-auto"
          type="submit"
          loading={!canProceed}
          disabled={!canProceed}
        >
          {canProceed ? t("common.continue") : t("common.please-wait")}
        </Button>
      </form>
    </FormProvider>
  );
};
