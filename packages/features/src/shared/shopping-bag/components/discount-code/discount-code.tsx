"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { BaseError } from "@nimara/domain/objects/Error";
import { TextFormField } from "@nimara/foundation/form-components/text-form-field";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { useDiscountCodeActions } from "../../hooks";
import { type DiscountCodeActions } from "../../types";
import { type FormSchema, formSchema } from "./schema";
import { useTranslations } from "next-intl";

export interface DiscountCodeProps {
  actions?: DiscountCodeActions;
  checkout: Checkout;
}

export const DiscountCode = ({
  checkout,
  actions: propsActions,
}: DiscountCodeProps) => {
  const contextActions = useDiscountCodeActions();
  const actions = propsActions ?? contextActions;
  const t = useTranslations();
  const { toast } = useToast();
  const [isTransitioning, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [shouldClearInput, setShouldClearInput] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      code: "",
    },
  });

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const promoCode = checkout?.voucherCode;
  const isCodeApplied =
    !!checkout?.discount?.amount &&
    !form.formState.isSubmitting &&
    !form.formState.isLoading;

  const handleSubmit = async (values: FormSchema) => {
    if (!actions) {
      return;
    }

    startTransition(
      () =>
        void (async () => {
          const result = await actions.addPromoCode({
            checkoutId: checkout.id,
            promoCode: values.code,
          });

          if (result.ok) {
            setIsOpen(false);

            return;
          }

          const isPromoCodeInvalid = result.errors.find(
            (error: BaseError) => error.code === "INVALID_VALUE_ERROR",
          );

          const notApplicableError = result.errors.find(
            (error: BaseError) => error.code === "VOUCHER_NOT_APPLICABLE_ERROR",
          );

          if (isPromoCodeInvalid) {
            form.setError("code", {
              message: t("errors.DISCOUNT_CODE_NOT_EXIST_ERROR", {
                code: `(${values.code})`,
              }),
            });
            setShouldClearInput(true);

            return;
          }
          if (notApplicableError) {
            form.setError("code", {
              message: t("errors.VOUCHER_NOT_APPLICABLE_ERROR", {
                code: `(${values.code})`,
              }),
            });
            setShouldClearInput(true);

            return;
          } else {
            toast({
              description: t("errors.UNKNOWN_ERROR"),
              variant: "destructive",
              position: "center",
            });
          }
        })(),
    );
  };

  const handleRemoveCode = async (
    _event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!actions) {
      return;
    }

    startTransition(
      () =>
        void (async () => {
          if (promoCode) {
            const result = await actions.removePromoCode({
              checkoutId: checkout.id,
              promoCode,
            });

            if (result.ok) {
              toast({
                description: t("cart.discount-removed"),
                position: "center",
              });

              form.reset({ code: "" });

              return;
            }

            toast({
              description: t("errors.DISCOUNT_CODE_REMOVE_ERROR"),
              variant: "destructive",
              position: "center",
            });
          }

          return;
        })(),
    );
  };

  // clear input field after displaying error
  useEffect(() => {
    if (shouldClearInput) {
      const timer = setTimeout(() => {
        form.reset({ code: "" });
        setShouldClearInput(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldClearInput, form]);

  return (
    <>
      <div className="py-4">
        <div className="text-foreground flex items-center justify-between text-sm">
          <span>
            {t("cart.discount-code", {
              code: isCodeApplied && !isTransitioning ? `(${promoCode})` : "",
            })}
          </span>
          {isTransitioning ? null : !isCodeApplied && !isOpen ? (
            actions ? (
              <span
                className="dark:text-muted-foreground cursor-pointer text-stone-700 hover:underline"
                onClick={toggleOpen}
              >
                {t("cart.add-discount")}
              </span>
            ) : null
          ) : (
            actions && (
              <Button
                variant="ghost"
                className="px-3 py-4"
                onClick={isCodeApplied ? handleRemoveCode : toggleOpen}
              >
                <X height={16} width={16} />
              </Button>
            )
          )}
        </div>

        {!isCodeApplied && isOpen && actions && (
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-1 flex space-x-2"
              id="promo-code-form"
            >
              <div className="flex-grow">
                <TextFormField
                  name="code"
                  placeholder={t("cart.type-code")}
                  label=""
                />
              </div>
              <Button
                className="text-primary mt-2 rounded-sm"
                variant="outline"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {t("cart.redeem")}
              </Button>
            </form>
          </FormProvider>
        )}
      </div>
      <hr className="border-stone-200" />
    </>
  );
};
