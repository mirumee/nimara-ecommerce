"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { CHANGE_EMAIL_TOKEN_VALIDITY_IN_HOURS } from "@/config";

import { updateUserEmail } from "./actions";
import { type UpdateEmailFormSchema, updateEmailFormSchema } from "./schema";

export function UpdateEmailForm({ oldEmail }: { oldEmail: string }) {
  const t = useTranslations();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<UpdateEmailFormSchema>({
    resolver: zodResolver(updateEmailFormSchema({ t })),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isDisabled = form.formState.isSubmitting;

  async function handleSubmit(values: UpdateEmailFormSchema) {
    if (oldEmail === values.email) {
      form.setError("email", {
        message: t("errors.auth.newEmailAddressMustBeDifferent"),
      });

      return;
    }
    const result = await updateUserEmail(values);

    if (result.ok) {
      setIsEmailSent(true);

      return;
    }

    result.errors.forEach((error) => {
      if (error.field) {
        if (error.field === "newEmail") {
          form.setError("email", { message: t(`errors.auth.${error.field}`) });
        }
        if (error.field === "password") {
          form.setError(error.field, {
            message: t(`errors.auth.${error.field}`),
          });
        }
      } else {
        form.setError("email", {
          message: t(`errors.${error.code}`),
        });
      }
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEmailSent
            ? t("account.you-need-to-confirm-your-new-email")
            : t("account.change-email")}
        </DialogTitle>
      </DialogHeader>

      {isEmailSent ? (
        <div className="space-y-10">
          <p className="text-sm text-stone-500">
            {t("account.confirm-new-email-description", {
              timeRemaining: CHANGE_EMAIL_TOKEN_VALIDITY_IN_HOURS,
            })}
          </p>
          <DialogClose asChild className="w-full">
            <Button className="mx-auto w-full">
              {t("account.confirm-new-email-button")}
            </Button>
          </DialogClose>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-y-3 py-2"
            id="update-user-email-form"
            noValidate
          >
            <div className="w-full">
              <TextFormField
                name="password"
                label={t("common.password")}
                type="password"
              />
            </div>
            <div className="w-full">
              <TextFormField
                name="email"
                label={t("account.new-email")}
                type="email"
              />
            </div>

            <DialogFooter>
              <Button
                className="mt-4"
                type="submit"
                form="update-user-email-form"
                disabled={isDisabled}
                loading={isDisabled}
              >
                {t("common.save-changes")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </>
  );
}
