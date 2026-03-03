"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";

import { type Address } from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { displayFormattedAddressLines } from "@nimara/foundation/address/address";
import type { FormattedAddress } from "@nimara/foundation/address/types";
import { RadioFormGroup } from "@nimara/foundation/form-components/radio-form-group";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { updateCheckoutAddressAction } from "@/foundation/checkout/actions/update-checkout-address-action";
import { isGlobalError } from "@/foundation/errors/errors";
import { paths } from "@/foundation/routing/paths";

import type { SavedAddressFormSchema } from "../schema";

interface SavedAddressesProps {
  addresses: FormattedAddress[];
  checkout: Checkout;
  setEditedAddress: (value: Address | null) => void;
}

export const SavedAddresses = ({
  addresses,
  checkout,
  setEditedAddress,
}: SavedAddressesProps) => {
  const t = useTranslations();
  const router = useRouter();

  const { toast } = useToast();

  const selectedAddressId =
    addresses.find(({ address }) => address.id === checkout.shippingAddress?.id)
      ?.address.id ?? addresses[0].address.id;

  const form = useForm<SavedAddressFormSchema>({
    defaultValues: {
      shippingAddressId: selectedAddressId,
    },
  });

  const isDisabled = form.formState.isSubmitting;

  const handleSubmit = async ({
    shippingAddressId,
  }: SavedAddressFormSchema) => {
    const { id: _, ...shippingAddress } = addresses.find(
      ({ address }) => address.id === shippingAddressId,
    )!.address;

    const result = await updateCheckoutAddressAction({
      id: checkout.id,
      address: shippingAddress,
      type: "SHIPPING",
    });

    if (result.ok) {
      void router.push(
        paths.checkout.asPath({ query: { step: "delivery-method" } }),
      );

      return;
    }

    result.errors.map(({ field, code }) => {
      if (isGlobalError(field)) {
        toast({ variant: "destructive", description: t(`errors.${code}`) });
      } else {
        form.setError("shippingAddressId", {
          message: t(`errors.${code}`),
        });
      }
    });
  };

  const handleEditAddressFormOpen = (address: Address) => {
    setEditedAddress(address);

    void router.push(
      paths.checkout.asPath({
        query: { step: "shipping-address", country: address.country },
      }),
    );
  };

  const handleCancel = () => {
    void router.push(
      paths.checkout.asPath({ query: { step: "delivery-method" } }),
    );
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        noValidate
      >
        <RadioFormGroup
          label={t("shipping-address.title")}
          name="shippingAddressId"
          isSrOnlyLabel={true}
          options={addresses.map(({ address }) => ({
            value: address.id,
          }))}
          className="mb-0 rounded-none border-b-0 p-4 text-sm first-of-type:rounded-t last-of-type:rounded-b last-of-type:border-b"
        >
          {addresses.map(({ address, formattedAddress }) => (
            <div className="flex w-full flex-row gap-2" key={address.id}>
              <div className="flex-1 leading-5">
                {displayFormattedAddressLines({
                  addressId: address.id,
                  formattedAddress,
                })}
              </div>
              <div className="flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  className="float-right"
                  onClick={() => handleEditAddressFormOpen(address)}
                  aria-label={t("common.edit")}
                >
                  {t("common.edit")}
                </Button>
              </div>
            </div>
          ))}
        </RadioFormGroup>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            onClick={() => handleCancel()}
          >
            {t("common.cancel")}
          </Button>

          <Button
            type="submit"
            className="float-right"
            disabled={isDisabled}
            loading={isDisabled}
            aria-label={
              isDisabled ? t("common.please-wait") : t("common.continue")
            }
          >
            {isDisabled ? t("common.please-wait") : t("common.continue")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
