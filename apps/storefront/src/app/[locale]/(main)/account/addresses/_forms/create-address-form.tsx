"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import { Button } from "@nimara/ui/components/button";
import { DialogClose } from "@nimara/ui/components/dialog";
import { useToast } from "@nimara/ui/hooks";

import { storefrontLogger } from "@/services/logging";

import { createNewAddress } from "./actions";
import { type FormSchema, formSchema } from "./schema";

const IS_DEFAULT_BILLING_ADDRESS = "isDefaultBillingAddress";
const IS_DEFAULT_SHIPPING_ADDRESS = "isDefaultShippingAddress";

const fields: Array<keyof Address> = [
  ...ADDRESS_CORE_FIELDS,
  IS_DEFAULT_SHIPPING_ADDRESS,
  IS_DEFAULT_BILLING_ADDRESS,
];

export const AddNewAddressForm = ({
  countries,
  addressFormRows,
  countryCode,
  onModalClose,
}: {
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  countryCode: AllCountryCode;
  onModalClose: () => void;
}) => {
  const t = useTranslations();
  const { toast } = useToast();

  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ addressFormRows, t })),
    defaultValues: {
      ...[...fields].reduce(
        (acc, fieldName) => ({
          ...acc,
          [fieldName]: "",
        }),
        {},
      ),
      country: countryCode,
      isDefaultBillingAddress: false,
      isDefaultShippingAddress: false,
    },
  });

  const canProceed = !form.formState.isSubmitting && !isCountryChanging;

  const handleSubmit = async (address: FormSchema) => {
    const result = await createNewAddress(address);

    if (!result.ok) {
      storefrontLogger.error("Address create failed", { result });

      return;
    }

    toast({
      description: t("address.new-address-has-been-added"),
      position: "center",
    });

    onModalClose();
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-6 pt-2"
        id="add-new-address-form"
        noValidate
      >
        <AddressForm
          addressFormRows={addressFormRows}
          countries={countries}
          onCountryChange={setIsCountryChanging}
        />
        <div className="space-y-3">
          <CheckboxField
            className="py-0"
            name={IS_DEFAULT_SHIPPING_ADDRESS}
            label={t("address.default-shipping")}
          />
          <CheckboxField
            className="py-0"
            name={IS_DEFAULT_BILLING_ADDRESS}
            label={t("address.default-billing")}
          />
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <Button
            type="submit"
            form="add-new-address-form"
            disabled={!canProceed}
            loading={!canProceed}
          >
            {canProceed ? t("address.save-new-address") : t("common.saving")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
