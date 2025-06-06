"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";

import { addPromoCode, removePromoCode } from "../../actions";
import { type FormSchema, formSchema } from "./schema";

export const DiscountCode = ({ checkout }: { checkout: Checkout }) => {
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
    startTransition(
      () =>
        void (async () => {
          const result = await addPromoCode({
            checkoutId: checkout.id,
            promoCode: values.code,
          });

          if (result.ok) {
            setIsOpen(false);

            return;
          }

          const isPromoCodeInvalid = result.errors.find(
            (error) => error.code === "INVALID_VALUE_ERROR",
          );

          const notApplicableError = result.errors.find(
            (error) => error.code === "VOUCHER_NOT_APPLICABLE_ERROR",
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
    startTransition(
      () =>
        void (async () => {
          if (promoCode) {
            const result = await removePromoCode({
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
        <div className="flex items-center justify-between text-sm text-stone-700">
          <span>
            {t("cart.discount-code", {
              code: isCodeApplied && !isTransitioning ? `(${promoCode})` : null,
            })}
          </span>
          {isTransitioning ? null : !isCodeApplied && !isOpen ? (
            <span
              className="cursor-pointer text-stone-700 hover:underline"
              onClick={toggleOpen}
            >
              {t("cart.add-discount")}
            </span>
          ) : (
            <Button
              variant="ghost"
              className="px-3 py-4"
              onClick={isCodeApplied ? handleRemoveCode : toggleOpen}
            >
              <X height={16} width={16} />
            </Button>
          )}
        </div>

        {!isCodeApplied && isOpen && (
          <Form {...form}>
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
                className="mt-2 rounded-sm text-stone-900"
                variant="outline"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {t("cart.redeem")}
              </Button>
            </form>
          </Form>
        )}
      </div>
      <hr className="border-stone-200" />
    </>
  );
};
