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

          if (result.isSuccess) {
            setIsOpen(false);
          }

          if ("serverError" in result) {
            toast({
              description: t("errors.checkout.couldNotProcess"),
              variant: "destructive",
              position: "center",
            });

            return;
          }

          if ("validationErrors" in result) {
            const isPromoCodeInvalid = result.validationErrors.find(
              (error) => error.code === "INVALID",
            );

            form.setError("code", {
              message: isPromoCodeInvalid
                ? t("errors.checkout.codeDoesNotExist", {
                    code: `(${values.code})`,
                  })
                : t("errors.checkout.codeNotApplicable"),
            });
            setShouldClearInput(true);

            return;
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

            if (result.isSuccess) {
              toast({
                description: t("cart.discount-removed"),
                position: "center",
              });

              form.reset({ code: "" });

              return;
            }

            if ("serverError" in result || "validationErrors" in result) {
              toast({
                description: t("errors.checkout.couldNotRemove"),
                variant: "destructive",
                position: "center",
              });

              return;
            }
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
        <div className="flex items-center justify-between text-stone-700">
          <span>
            {t("cart.discount-code", {
              code: isCodeApplied && !isTransitioning ? `(${promoCode})` : null,
            })}
          </span>
          {isTransitioning ? null : !isCodeApplied && !isOpen ? (
            <span
              className="cursor-pointer text-stone-900 hover:underline"
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
