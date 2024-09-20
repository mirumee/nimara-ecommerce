"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { CountryCode, CountryDisplay } from "@nimara/codegen/schema";
import type { AddressFormRow } from "@nimara/domain/objects/AddressForm";
import type { Checkout } from "@nimara/domain/objects/Checkout";
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
import { type FormSchema, formSchema } from "./schema";

export const CreateShippingAddressForm = ({
  checkout,
  countries,
  addressFormRows,
  countryCode,
}: {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: Omit<CountryDisplay, "vat">[];
  countryCode: CountryCode;
}) => {
  const t = useTranslations();

  const { toast } = useToast();
  const { isRedirecting, push } = useRouterWithState();
  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ addressFormRows, t })),
    defaultValues: {
      ...[...ADDRESS_CORE_FIELDS].reduce(
        (acc, fieldName) => ({
          ...acc,
          [fieldName]: "",
        }),
        {},
      ),
      country: countryCode,
      saveForFutureUse: false,
    },
  });

  const canProceed =
    !form.formState.isSubmitting && !isCountryChanging && !isRedirecting;

  const handleSubmit = async (input: FormSchema) => {
    const { errors } = await createCheckoutShippingAddress({
      checkoutId: checkout.id,
      input,
    });

    if (!errors.length) {
      push(paths.checkout.deliveryMethod.asPath());

      return;
    }

    errors.map(({ field, message }) => {
      if (isGlobalError(field)) {
        toast({ variant: "destructive", description: t(message) });
      } else {
        form.setError(field as keyof FormSchema, {
          message: t(message),
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
            countryCode={countryCode}
            onCountryChange={setIsCountryChanging}
          />
        </div>
        <CheckboxField
          className="py-0"
          name="saveForFutureUse"
          label={t("address.save-address-for-future")}
        />
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
