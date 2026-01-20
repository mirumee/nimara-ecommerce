"use client";

import { useTranslations } from "next-intl";
import { FormProvider, type UseFormReturn } from "react-hook-form";

import type { FieldType } from "@nimara/domain/objects/AddressForm";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { TextFormField } from "@nimara/foundation/form-components/text-form-field";
import type { TranslationMessage } from "@nimara/foundation/i18n/types";
import { cn } from "@nimara/foundation/lib/cn";
import { Button } from "@nimara/ui/components/button";

import { useRouterWithState } from "@/foundation/use-router-with-state";

import { checkIfUserHasAnAccount, updateUserDetails } from "./actions";
import { type EmailFormSchema } from "./schema";

export const UserEmailForm = ({
  checkout,
  form,
  setUserAccountEmail,
}: {
  checkout: Checkout;
  form: UseFormReturn<EmailFormSchema>;
  setUserAccountEmail: (email: string) => void;
}) => {
  const t = useTranslations();
  const { isRedirecting, push } = useRouterWithState();

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  const handleSubmit = async ({ email }: EmailFormSchema) => {
    const checkResult = await checkIfUserHasAnAccount(email);

    if (checkResult.ok && checkResult.data.user) {
      setUserAccountEmail(checkResult.data.user.email);

      return;
    }

    const result = await updateUserDetails({
      checkout,
      email,
    });

    if (result.ok) {
      push(result.data.redirectUrl);

      return;
    }

    result.errors.map((error) => {
      if (error.field) {
        form.setError(error.field as keyof EmailFormSchema, {
          message: t(`errors.${error.code}`),
        });
      } else {
        form.setError("root", {
          message: t(`errors.${error.code}`),
        });
      }
    });
  };

  const serverErrorCode = form.formState.errors.root?.message;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-2"
        id="user-details-email-form"
        noValidate
      >
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <TextFormField
                label={t("user-details.email")}
                name="email"
                type={"email" as FieldType}
                isRequired={true}
              />
            </div>
            <Button
              className={cn({ "mb-[1.813rem]": form.formState.errors.email })}
              type="submit"
              form="user-details-email-form"
              disabled={isDisabled}
              loading={isDisabled}
            >
              {isDisabled ? t("common.saving") : t("common.continue")}
            </Button>
          </div>
        </div>
        {serverErrorCode && (
          <p className="text-destructive">
            {t(serverErrorCode as TranslationMessage)}
          </p>
        )}
      </form>
    </FormProvider>
  );
};
