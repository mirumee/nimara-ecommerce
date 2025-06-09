"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { useForm } from "react-hook-form";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { RadioFormGroup } from "@/components/form/radio-form-group";
import { isGlobalError } from "@/lib/errors";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { useRouterWithState } from "@/lib/hooks";
import type { TranslationMessage } from "@/types";

import { updateDeliveryMethod } from "./_actions/update-delivery-method";
import { type FormSchema, formSchema } from "./schema";

const DELIVERY_METHOD_ID = "deliveryMethodId";

export const DeliveryMethodForm = ({ checkout }: { checkout: Checkout }) => {
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
                      <p className="text-muted-foreground w-1/2 text-end">
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
