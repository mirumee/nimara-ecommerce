"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { MIN_PASSWORD_LENGTH } from "@/config";
import { useRouterWithState } from "@/lib/hooks";

import { setPassword } from "./actions";
import { type NewPasswordFormSchema, newPasswordFormSchema } from "./schema";

export function NewPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<NewPasswordFormSchema>({
    mode: "onChange",
    resolver: zodResolver(newPasswordFormSchema({ t })),
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  async function handleSubmit(values: NewPasswordFormSchema) {
    const data = await setPassword(values);

    push(data.redirectUrl);
  }

  useEffect(() => {
    if (error === "true") {
      form.reset({
        password: "",
        confirm: "",
      });
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-normal leading-8 text-stone-900">
        {t("auth.set-up-new-password")}
      </h1>

      {error === "true" && (
        <p className="text-destructive pb-2 text-sm">
          {t("auth.set-up-new-password-error")}
        </p>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-y-2"
          id="set-up-new-password-form"
          ref={formRef}
          noValidate
        >
          <div className="w-full">
            <TextFormField
              name="password"
              label={t("auth.new-password")}
              type="password"
              placeholder={t("auth.password-placeholder", {
                minPasswordLength: MIN_PASSWORD_LENGTH,
              })}
            />
          </div>
          <div className="w-full">
            <TextFormField
              name="confirm"
              label={t("auth.confirm-new-password")}
              type="password"
            />
          </div>

          <Button
            className="my-4 w-full"
            type="submit"
            form="set-up-new-password-form"
            disabled={isDisabled}
            loading={isDisabled}
          >
            {isDisabled ? t("common.please-wait") : t("auth.password-reset")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
