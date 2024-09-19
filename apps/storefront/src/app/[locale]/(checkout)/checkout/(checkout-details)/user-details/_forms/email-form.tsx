"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import type { FieldType } from "@nimara/domain/objects/AddressForm";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { useRouterWithState } from "@/lib/hooks";
import type { TranslationMessage } from "@/types";

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
    const data = await checkIfUserHasAnAccount(email);

    if (data?.email) {
      setUserAccountEmail(data.email);

      return;
    }

    const result = await updateUserDetails({
      checkout,
      email,
    });

    const { errorsMap, serverError, redirectUrl } = result ?? {};

    if (redirectUrl) {
      push(redirectUrl);
    }

    if (serverError) {
      // maybe to remove and show in toast
      form.setError("root.server-error", {
        message: t(`server-errors.${serverError.code}` as TranslationMessage),
        type: serverError.code,
      });
    }
    if (errorsMap) {
      Object.entries(errorsMap).forEach(([fieldName, code]) => {
        form.setError(fieldName as keyof EmailFormSchema, {
          message: t(`checkout-errors.${code}` as TranslationMessage),
          type: code,
        });
      });
    }
  };

  const serverErrorCode = form.formState.errors.root?.serverError?.message;

  return (
    <Form {...form}>
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
              className={clsx(
                form.formState.errors.email && "mb-[1.813rem]",
                "ml-2",
              )}
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
          <p className="text-red-600">
            {t(serverErrorCode as TranslationMessage)}
          </p>
        )}
      </form>
    </Form>
  );
};
