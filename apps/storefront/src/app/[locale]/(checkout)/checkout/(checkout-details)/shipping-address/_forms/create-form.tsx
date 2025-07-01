"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { AddressForm } from "@/components/address-form/address-form";
import { CheckboxField } from "@/components/form/checkbox-field";
import { isGlobalError } from "@/lib/errors";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import { createCheckoutShippingAddress } from "./actions";
import {
  type CreateShippingAddressSchema,
  createShippingAddressSchema,
  type UpdateShippingAddressSchema,
} from "./schema";

export const CreateShippingAddressForm = ({
  addressFormRows,
  shouldSaveForFuture,
  checkout,
  countries,
  countryCode,
}: {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  shouldSaveForFuture: boolean;
}) => {
  const t = useTranslations();

  const { toast } = useToast();
  const { isRedirecting, push } = useRouterWithState();
  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<CreateShippingAddressSchema>({
    resolver: zodResolver(createShippingAddressSchema({ addressFormRows, t })),
    defaultValues: {
      ...ADDRESS_CORE_FIELDS.reduce(
        (acc, fieldName) => ({
          ...acc,
          [fieldName]:
            fieldName === "country"
              ? (checkout.shippingAddress?.country ?? countryCode)
              : (checkout.shippingAddress?.[fieldName] ?? ""),
        }),
        {},
      ),
      saveForFutureUse: false,
    },
  });

  const canProceed =
    !form.formState.isSubmitting && !isCountryChanging && !isRedirecting;

  const handleSubmit: SubmitHandler<CreateShippingAddressSchema> = async (
    data,
  ) => {
    const result = await createCheckoutShippingAddress({
      checkoutId: checkout.id,
      input: data,
    });

    if (result.ok) {
      push(paths.checkout.deliveryMethod.asPath());

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
    <Form {...form}>
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
    </Form>
  );
};
