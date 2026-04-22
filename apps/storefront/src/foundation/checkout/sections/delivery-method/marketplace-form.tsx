"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { RadioFormGroup } from "@nimara/foundation/form-components/radio-form-group";
import { Button } from "@nimara/ui/components/button";

import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import { useRouterWithState } from "@/foundation/use-router-with-state";

import { updateMarketplaceDeliveryMethods } from "./actions";
import { getDeliveryMethodOptions } from "./helpers/get-delivery-method-options";

interface MarketplaceDeliveryMethodFormProps {
  checkoutItems: MarketplaceCheckoutItem[];
  onComplete?: () => void;
}

export const MarketplaceDeliveryMethodForm = ({
  checkoutItems,
  onComplete,
}: MarketplaceDeliveryMethodFormProps) => {
  const t = useTranslations();
  const formatter = useFormatter();
  const { isRedirecting, push } = useRouterWithState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalErrors, setGlobalErrors] = useState<AppErrorCode[]>([]);
  const form = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(
      checkoutItems.map((item) => [
        `deliveryMethod-${item.checkoutId}`,
        item.checkout.deliveryMethod?.id ??
          item.checkout.shippingMethods[0]?.id ??
          "",
      ]),
    ),
  });

  const isDisabled = isRedirecting || isSubmitting;

  const onSubmit = async (values: Record<string, string>) => {
    if (isDisabled) {
      return;
    }

    setGlobalErrors([]);
    setIsSubmitting(true);

    const selectionsByCheckoutId = Object.fromEntries(
      checkoutItems.map((item) => [
        item.checkoutId,
        values[`deliveryMethod-${item.checkoutId}`] ?? "",
      ]),
    );

    const result = await updateMarketplaceDeliveryMethods({
      selectionsByCheckoutId,
    });

    if (!result.ok) {
      setGlobalErrors(result.errors.map((error) => error.code));
      setIsSubmitting(false);

      return;
    }

    if (onComplete) {
      onComplete();
    } else {
      push(result.data.redirectUrl);
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {checkoutItems.map(({ checkout, checkoutId, vendorDisplayName }) => (
          <div key={checkoutId} className="rounded-md bg-muted p-4">
            <div className="grid">
              <span className="text-xs leading-4 text-muted-foreground">
                Sells and delivered by
              </span>
              <span className="text-sm font-semibold text-primary">
                {vendorDisplayName}
              </span>
            </div>
            <RadioFormGroup
              label={t("delivery-method.delivery-method")}
              name={`deliveryMethod-${checkoutId}`}
              isSrOnlyLabel={true}
              options={getDeliveryMethodOptions({
                shippingMethods: checkout.shippingMethods,
                getDescription: (method) =>
                  formatter.number(method.price.amount, {
                    style: "currency",
                    currency: method.price.currency,
                  }),
              })}
            >
              {checkout.shippingMethods.map((method) => (
                <div key={method.id} className="flex w-full">
                  <p className="w-1/2">{method.name}</p>
                  <p className="w-1/2 text-end text-primary">
                    {formatter.number(method.price.amount, {
                      style: "currency",
                      currency: method.price.currency,
                    })}
                  </p>
                </div>
              ))}
            </RadioFormGroup>
          </div>
        ))}

        {globalErrors.length > 0 && (
          <div className="space-y-1">
            {globalErrors.map((errorCode, index) => (
              <p key={`${errorCode}-${index}`} className="text-red-600">
                {t(`errors.${errorCode}`)}
              </p>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="ml-auto mt-4"
          disabled={isDisabled}
          loading={isDisabled}
        >
          {isDisabled ? t("common.saving") : t("common.continue")}
        </Button>
      </form>
    </FormProvider>
  );
};
