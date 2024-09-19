"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { DialogFooter } from "@nimara/ui/components/dialog";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";
import { MIN_PASSWORD_LENGTH } from "@/config";
import { type TranslationMessage } from "@/types";

import { updateUserPassword } from "./actions";
import {
  type UpdatePasswordFormSchema,
  updatePasswordFormSchema,
} from "./schema";

export function UpdatePasswordForm({
  onModalClose,
}: {
  onModalClose: () => void;
}) {
  const t = useTranslations();
  const { toast } = useToast();

  const form = useForm<UpdatePasswordFormSchema>({
    resolver: zodResolver(updatePasswordFormSchema({ t })),
    defaultValues: {
      confirm: "",
      newPassword: "",
    },
  });
  const formError = form.formState.errors?.root;

  async function handleSubmit(values: UpdatePasswordFormSchema) {
    const data = await updateUserPassword(values);

    if (data.success) {
      onModalClose();
      toast({
        description: t("account.password-updated"),
        position: "center",
      });

      return;
    }

    // Handle server errors
    if ("serverError" in data) {
      form.setError("root", {
        message: t(
          `errors.server.${data.serverError.code}` as TranslationMessage,
        ),
      });

      return;
    }

    // Handle validation errors
    if ("errors" in data) {
      data.errors.forEach((error) => {
        const field = error.field;

        if (field) {
          form.setError(field as keyof UpdatePasswordFormSchema, {
            message: t(
              `errors.auth.${field as TranslationMessage<"errors.auth">}`,
            ),
          });
        }
      });

      return;
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-3 py-2"
        id="update-user-password-form"
        noValidate
      >
        <div className="mt-3 text-sm text-stone-500">
          <p>{t("account.new-password-requirements")}</p>
          <ul className="list-inside list-disc">
            <li>
              {t("auth.password-placeholder", {
                minPasswordLength: MIN_PASSWORD_LENGTH,
              })}
            </li>
          </ul>
        </div>

        {formError && <div className="text-error">{formError.message}</div>}

        <div className="w-full">
          <TextFormField
            name="oldPassword"
            label={t("account.current-password")}
            type="password"
          />
        </div>
        <div className="w-full">
          <TextFormField
            name="newPassword"
            label={t("auth.new-password")}
            type="password"
          />
        </div>
        <div className="w-full">
          <TextFormField
            name="confirm"
            label={t("account.confirm-new-password")}
            type="password"
          />
        </div>
        <DialogFooter>
          <Button
            className="mt-4"
            type="submit"
            form="update-user-password-form"
            disabled={form.formState.isSubmitting}
            loading={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t("common.please-wait")
              : t("common.save-changes")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
