"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { isGlobalError } from "@/foundation/errors/errors";
import { paths } from "@/foundation/routing/paths";
import { useRouterWithState } from "@/foundation/use-router-with-state";

import { createCheckoutShippingAddress } from "../actions";
import { getAddressFormDefaultValues } from "../helpers/get-address-form-default-values";
import {
  type CreateShippingAddressSchema,
  createShippingAddressSchema,
  type UpdateShippingAddressSchema,
} from "../schema";

interface CreateShippingAddressFormProps {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  shouldSaveForFuture: boolean;
}

export const CreateShippingAddressForm = ({
  addressFormRows,
  shouldSaveForFuture,
  checkout,
  countries,
  countryCode,
}: CreateShippingAddressFormProps) => {
  const t = useTranslations();

  const { toast } = useToast();
  const { isRedirecting, push } = useRouterWithState();
  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<CreateShippingAddressSchema>({
    resolver: zodResolver(createShippingAddressSchema({ addressFormRows, t })),
    defaultValues: {
      ...getAddressFormDefaultValues({
        address: checkout.shippingAddress,
        countryCode,
      }),
      saveForFutureUse: false,
    },
  });

  const canProceed =
    !form.formState.isSubmitting && !isCountryChanging && !isRedirecting;

  const handleSubmit: SubmitHandler<CreateShippingAddressSchema> = async (
    data,
  ) => {
    const result = await createCheckoutShippingAddress({
      id: checkout.id,
      input: data,
    });

    if (result.ok) {
      push(paths.checkout.asPath({ query: { step: "delivery-method" } }));

      return;
    }

    result.errors.map(({ field, code }) => {
      if (isGlobalError(field)) {
        toast({ variant: "destructive", description: t(`errors.${code}`) });
      } else {
        form.setError(field as keyof UpdateShippingAddressSchema, {
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
        id="shipping-address-form"
        noValidate
      >
        <div>
          <AddressForm
            addressFormRows={addressFormRows}
            countries={countries}
            onCountryChange={setIsCountryChanging}
            isDisabled={form.formState.isSubmitting}
          />
        </div>
        {shouldSaveForFuture && (
          <CheckboxField
            className="py-0"
            name="saveForFutureUse"
            label={t("address.save-address-for-future")}
          />
        )}
        <Button
          className="ml-auto"
          type="submit"
          form="shipping-address-form"
          disabled={!canProceed}
          loading={!canProceed}
        >
          {canProceed ? t("common.continue") : t("common.please-wait")}
        </Button>
      </form>
    </FormProvider>
  );
};
