"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { type CountryCode, type CountryDisplay } from "@nimara/codegen/schema";
import { type Address } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import { loggingService } from "@nimara/infrastructure/logging/service";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { AddressForm } from "@/components/address-form/address-form";
import { addressSchema as formSchema } from "@/components/address-form/schema";
import { useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { updateShippingAddress } from "./actions";
import { type FormSchema } from "./schema";

export const UpdateShippingAddressForm = ({
  address,
  countries,
  addressFormRows,
  countryCode,
  setEditedAddress,
}: {
  address: Address;
  addressFormRows: readonly AddressFormRow[];
  countries: Omit<CountryDisplay, "vat">[];
  countryCode: CountryCode;
  setEditedAddress: (value: Address | null) => void;
}) => {
  const t = useTranslations();
  const router = useRouter();

  const [isCountryChanging, setIsCountryChanging] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ addressFormRows, t })),
    defaultValues: [...ADDRESS_CORE_FIELDS].reduce(
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

  const handleSubmit = async (shippingAddress: FormSchema) => {
    const data = await updateShippingAddress({
      id: address.id,
      input: shippingAddress,
    });

    if (data?.errors.length) {
      loggingService.error("Shipping address update failed", {
        error: data.errors[0],
      });
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
            countryCode={countryCode}
            onCountryChange={setIsCountryChanging}
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
