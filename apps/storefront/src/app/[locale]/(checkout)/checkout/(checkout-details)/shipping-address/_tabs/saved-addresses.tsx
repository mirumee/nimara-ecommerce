"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import type { Address } from "@nimara/domain/objects/Address";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { RadioFormGroup } from "@/components/form/radio-form-group";
import { updateCheckoutAddressAction } from "@/lib/actions/update-checkout-address-action";
import { displayFormattedAddressLines } from "@/lib/address";
import type { FormattedAddress } from "@/lib/checkout";
import { isGlobalError } from "@/lib/errors";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import type { SavedAddressFormSchema } from "../_forms/schema";

interface SavedAddressesProps {
  addresses: FormattedAddress[];
  checkout: Checkout;
  setEditedAddress: (value: Address | null) => void;
}

export function SavedAddresses({
  addresses,
  checkout,
  setEditedAddress,
}: SavedAddressesProps) {
  const t = useTranslations();

  const { toast } = useToast();
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<SavedAddressFormSchema>({
    defaultValues: {
      shippingAddressId: addresses[0].address.id,
    },
  });

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  const handleSubmit = async ({
    shippingAddressId,
  }: SavedAddressFormSchema) => {
    const { id: _, ...shippingAddress } = addresses.find(
      ({ address }) => address.id === shippingAddressId,
    )!.address;

    const result = await updateCheckoutAddressAction({
      checkoutId: checkout.id,
      address: shippingAddress,
      type: "shipping",
    });

    if (result.ok) {
      push(paths.checkout.deliveryMethod.asPath());

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

  function handleEditAddressFormOpen(address: Address) {
    setEditedAddress(address);
    push(
      paths.checkout.shippingAddress.asPath({
        query: { country: address.country },
      }),
    );
  }

  return (
    <Form {...form}>
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
            <div className="flex w-full flex-col gap-2" key={address.id}>
              <div className="leading-5">
                {displayFormattedAddressLines({
                  addressId: address.id,
                  formattedAddress,
                })}
              </div>
              <div>
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
      </form>
    </Form>
  );
}
