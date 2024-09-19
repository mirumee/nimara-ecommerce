"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { CountryCode, CountryDisplay } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import { loggingService } from "@nimara/infrastructure/logging/service";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { AddressForm } from "@/components/address-form/address-form";
import { CheckboxField } from "@/components/form/checkbox-field";

import { updateAddress } from "./actions";
import { type FormSchema, formSchema } from "./schema";

const IS_DEFAULT_BILLING_ADDRESS = "isDefaultBillingAddress";
const IS_DEFAULT_SHIPPING_ADDRESS = "isDefaultShippingAddress";

const fields: Array<keyof Address> = [
  ...ADDRESS_CORE_FIELDS,
  IS_DEFAULT_SHIPPING_ADDRESS,
  IS_DEFAULT_BILLING_ADDRESS,
];

export const EditAddressForm = ({
  address,
  countries,
  addressFormRows,
  countryCode,
  onModalClose,
  onModeChange,
}: {
  address: Address;
  addressFormRows: readonly AddressFormRow[];
  countries: Omit<CountryDisplay, "vat">[];
  countryCode: CountryCode;
  onModalClose: () => void;
  onModeChange: () => void;
}) => {
  const t = useTranslations();

  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ addressFormRows, t })),
    defaultValues: fields.reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]:
          fieldName === "country"
            ? address.country.code
            : (address[fieldName] ?? ""),
      }),
      {},
    ),
  });

  const canProceed = !form.formState.isSubmitting && !isCountryChanging;

  const handleSubmit = async (values: FormSchema) => {
    const data = await updateAddress({ id: address.id, input: values });

    if (data?.errors.length) {
      // TODO: Handle in UI
      loggingService.error("Address update failed", data.errors);

      return;
    }

    onModalClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-6 pt-2"
        id="edit-address-form"
        noValidate
      >
        <AddressForm
          addressFormRows={addressFormRows}
          countries={countries}
          countryCode={countryCode}
          onCountryChange={setIsCountryChanging}
        />
        <div className="space-y-3">
          {!address.isDefaultShippingAddress && (
            <CheckboxField
              className="py-0"
              name={IS_DEFAULT_SHIPPING_ADDRESS}
              label={t("address.default-shipping")}
            />
          )}
          {!address.isDefaultBillingAddress && (
            <CheckboxField
              className="py-0"
              name={IS_DEFAULT_BILLING_ADDRESS}
              label={t("address.default-billing")}
            />
          )}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <Button variant="outline" onClick={() => onModeChange()}>
            {t("address.delete-address")}
          </Button>

          <Button
            type="submit"
            form="edit-address-form"
            disabled={!canProceed || !form.formState.isDirty}
            loading={!canProceed}
          >
            {canProceed ? t("common.save-changes") : t("common.saving")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
