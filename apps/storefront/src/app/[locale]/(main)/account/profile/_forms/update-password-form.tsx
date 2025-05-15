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
    const result = await updateUserPassword(values);

    if (!result.ok) {
      result.errors.forEach((error) => {
        if (error.field) {
          form.setError(error.field as keyof UpdatePasswordFormSchema, {
            message: t(`errors.${error.code}`),
          });
        } else {
          form.setError("root", {
            message: t(`errors.${error.code}`),
          });
        }
      });

      return;
    }

    onModalClose();

    toast({
      description: t("account.password-updated"),
      position: "center",
    });
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
            {t("common.save-changes")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
