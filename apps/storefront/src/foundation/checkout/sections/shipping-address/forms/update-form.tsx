"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import { useRouter } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";

import { accountAddressUpdateAction } from "../actions";
import { getAddressFormDefaultValues } from "../helpers/get-address-form-default-values";
import {
  type UpdateShippingAddressSchema,
  updateShippingAddressSchema,
} from "../schema";

interface UpdateShippingAddressFormProps {
  address: Address;
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  setEditedAddress: (value: Address | null) => void;
}

export const UpdateShippingAddressForm = ({
  address,
  countries,
  addressFormRows,
  setEditedAddress,
}: UpdateShippingAddressFormProps) => {
  const t = useTranslations();
  const router = useRouter();

  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<UpdateShippingAddressSchema>({
    resolver: zodResolver(updateShippingAddressSchema({ addressFormRows, t })),
    defaultValues: getAddressFormDefaultValues({
      address,
      countryCode: address.country,
    }),
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
    router.push(paths.checkout.asPath({ query: { step: "shipping-address" } }));
  };

  const handleFormCancel = () => {
    setEditedAddress(null);
    router.push(paths.checkout.asPath({ query: { step: "shipping-address" } }));
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
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleFormCancel}>
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
    </FormProvider>
  );
};
