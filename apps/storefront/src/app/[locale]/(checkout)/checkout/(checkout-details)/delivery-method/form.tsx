"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { type FormEvent, Fragment, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { RadioFormGroup } from "@/components/form/radio-form-group";
import { isGlobalError } from "@/lib/errors";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { useRouterWithState } from "@/lib/hooks";
import type { TranslationMessage } from "@/types";

import {
  updateDeliveryMethod,
  updateMarketplaceDeliveryMethods,
} from "./_actions/update-delivery-method";
import { type FormSchema, formSchema } from "./schema";

const DELIVERY_METHOD_ID = "deliveryMethodId";

export const DeliveryMethodForm = ({
  checkout,
  marketplaceCheckouts,
}: {
  checkout: Checkout;
  marketplaceCheckouts?: Checkout[];
}) => {
  if (marketplaceCheckouts?.length) {
    return <MarketplaceDeliveryMethodForm checkouts={marketplaceCheckouts} />;
  }

  return <SingleDeliveryMethodForm checkout={checkout} />;
};

const SingleDeliveryMethodForm = ({ checkout }: { checkout: Checkout }) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      deliveryMethodId:
        checkout.deliveryMethod?.id ?? checkout.shippingMethods?.[0].id,
    },
  });

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  const handleSubmit = async (deliveryMethod: FormSchema) => {
    const result = await updateDeliveryMethod({
      checkout,
      deliveryMethodId: deliveryMethod.deliveryMethodId,
    });

    if (result.ok) {
      push(result.data.redirectUrl);

      return;
    }

    result.errors.forEach(({ field, code }) => {
      if (field) {
        form.setError(field as keyof FormSchema, {
          message: t(`errors.${code}`),
        });
      } else if (isGlobalError(field)) {
        form.setError("root.serverError", {
          message: t(`errors.${code}`),
        });
      }
    });
  };

  const deliveryMethodFormField = {
    label: t("delivery-method.delivery-method"),
    name: DELIVERY_METHOD_ID,
    isSrOnlyLabel: true,
    options: checkout.shippingMethods.map((method) => {
      const shippingMethodPrice = formatter.price({
        amount: method.price.amount,
      });

      return {
        label: method.name,
        value: method.id,
        description: shippingMethodPrice,
      };
    }),
  };
  const serverErrorCode = form.formState.errors.root?.serverError?.message;

  return (
    <section className="space-y-4 pt-4">
      <h2 className="scroll-m-20 text-2xl tracking-tight">
        {t("delivery-method.title")}
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-y-2"
          id="delivery-method-form"
          noValidate
        >
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="w-full">
                <RadioFormGroup {...deliveryMethodFormField}>
                  {deliveryMethodFormField.options.map((option) => (
                    <Fragment key={option.value}>
                      <p className="w-1/2">{option.label}</p>
                      <p className="w-1/2 text-end text-muted-foreground">
                        {option.description}
                      </p>
                    </Fragment>
                  ))}
                </RadioFormGroup>
              </div>
            </div>
          </div>
          {serverErrorCode ? (
            <p className="text-red-600">
              {t(serverErrorCode as TranslationMessage)}
            </p>
          ) : null}
          <Button
            type="submit"
            form="delivery-method-form"
            className="ml-auto mt-4"
            disabled={isDisabled}
            loading={isDisabled}
            aria-label={isDisabled ? t("common.saving") : t("common.continue")}
          >
            {isDisabled ? t("common.saving") : t("common.continue")}
          </Button>
        </form>
      </Form>
    </section>
  );
};

const MarketplaceDeliveryMethodForm = ({
  checkouts,
}: {
  checkouts: Checkout[];
}) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();
  const { isRedirecting, push } = useRouterWithState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrorCode, setServerErrorCode] = useState<string | null>(null);
  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      checkouts.map((checkout) => [
        checkout.id,
        checkout.deliveryMethod?.id ?? checkout.shippingMethods[0]?.id ?? "",
      ]),
    ),
  );

  const hasInvalidSelection = useMemo(
    () =>
      checkouts.some(
        (checkout) =>
          checkout.shippingMethods.length === 0 ||
          !selectedMethods[checkout.id],
      ),
    [checkouts, selectedMethods],
  );

  const isDisabled = isRedirecting || isSubmitting || hasInvalidSelection;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    setIsSubmitting(true);
    setServerErrorCode(null);

    const result = await updateMarketplaceDeliveryMethods({
      deliveryMethods: checkouts.map((checkout) => ({
        checkoutId: checkout.id,
        deliveryMethodId: selectedMethods[checkout.id],
      })),
    });

    if (result.ok) {
      push(result.data.redirectUrl);

      return;
    }

    setServerErrorCode(result.errors[0]?.code ?? "UNKNOWN_ERROR");
    setIsSubmitting(false);
  };

  return (
    <section className="space-y-4 pt-4">
      <h2 className="scroll-m-20 text-2xl tracking-tight">
        {t("delivery-method.title")}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4"
        noValidate
      >
        {checkouts.map((checkout, index) => (
          <fieldset key={checkout.id} className="space-y-2">
            <legend className="text-sm font-medium">
              {t("delivery-method.delivery-method")} #{index + 1}
            </legend>

            <div className="space-y-2">
              {checkout.shippingMethods.map((method) => {
                const shippingMethodPrice = formatter.price({
                  amount: method.price.amount,
                });

                return (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-stone-200 p-4 text-sm"
                    htmlFor={`${checkout.id}-${method.id}`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        id={`${checkout.id}-${method.id}`}
                        type="radio"
                        name={`delivery-${checkout.id}`}
                        value={method.id}
                        checked={selectedMethods[checkout.id] === method.id}
                        onChange={() =>
                          setSelectedMethods((current) => ({
                            ...current,
                            [checkout.id]: method.id,
                          }))
                        }
                        disabled={isSubmitting || isRedirecting}
                      />
                      <span>{method.name}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {shippingMethodPrice}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {serverErrorCode ? (
          <p className="text-red-600">
            {t(`errors.${serverErrorCode}` as TranslationMessage)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="ml-auto mt-4"
          disabled={isDisabled}
          loading={isDisabled}
          aria-label={isDisabled ? t("common.saving") : t("common.continue")}
        >
          {isDisabled ? t("common.saving") : t("common.continue")}
        </Button>
      </form>
    </section>
  );
};
