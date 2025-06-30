"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { AddressForm } from "@/components/address-form/address-form";
import { useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { storefrontLogger } from "@/services/logging";

import { accountAddressUpdateAction } from "./actions";
import {
  type UpdateShippingAddressSchema,
  updateShippingAddressSchema,
} from "./schema";

export const UpdateShippingAddressForm = ({
  address,
  countries,
  addressFormRows,
  setEditedAddress,
}: {
  address: Address;
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  setEditedAddress: (value: Address | null) => void;
}) => {
  const t = useTranslations();
  const router = useRouter();

  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const addressFormValues = ADDRESS_CORE_FIELDS.reduce(
    (acc, fieldName) => ({
      ...acc,
      [fieldName]:
        fieldName === "country" ? address.country : (address[fieldName] ?? ""),
    }),
    {},
  );

  const form = useForm<UpdateShippingAddressSchema>({
    resolver: zodResolver(updateShippingAddressSchema({ addressFormRows, t })),
    defaultValues: addressFormValues,
  });

  const canProceed = !form.formState.isSubmitting && !isCountryChanging;

  const handleSubmit: SubmitHandler<UpdateShippingAddressSchema> = async (
    data,
  ) => {
    const result = await accountAddressUpdateAction({
      id: address.id,
      input: data,
    });

    if (!result.ok) {
      storefrontLogger.error("Shipping address update failed", { result });
    }

    setEditedAddress(null);
    router.push(paths.checkout.shippingAddress.asPath());
  };

  function handleFormCancel() {
    setEditedAddress(null);
    router.push(paths.checkout.shippingAddress.asPath());
  }

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
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleFormCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="shipping-address-form"
            disabled={!canProceed}
            loading={!canProceed}
          >
            {canProceed ? t("common.save") : t("common.please-wait")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
