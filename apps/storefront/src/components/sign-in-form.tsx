"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";
import { login } from "@/lib/actions/login";
import { useRouterWithState } from "@/lib/hooks";

import { ResetPasswordLink } from "./reset-password-link";
import { type SignInSchema, signInSchema } from "./schema";

export function SignInForm({ redirectUrl }: { redirectUrl?: string }) {
  const t = useTranslations();

  const searchParams = useSearchParams();
  const hasPasswordChanged = searchParams.get("hasPasswordChanged") === "true";
  const isFromConfirmation = searchParams.get("confirmationSuccess") === "true";
  const { toast } = useToast();
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema({ t })),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  async function handleSubmit(values: SignInSchema) {
    const data = await login({ ...values, redirectUrl });

    if (data.redirectUrl) {
      push(data.redirectUrl);
    }

    if (data.error) {
      form.setError("email", { message: "" });
      form.setError("password", { message: "" });
    }
  }

  useEffect(() => {
    const toastTimeout = setTimeout(() => {
      if (isFromConfirmation) {
        toast({
          description: t("auth.confirm-account-success"),
          position: "center",
        });
      }
    }, 500);

    return () => window.clearTimeout(toastTimeout);
  }, [isFromConfirmation]);

  useEffect(() => {
    if (hasPasswordChanged) {
      toast({
        description: t("auth.set-up-new-password-success"),
        position: "center",
      });
    }
  }, [hasPasswordChanged]);

  return (
    <>
      <h1 className="pb-8 text-2xl font-normal leading-8 text-stone-900">
        {t("auth.sign-in")}
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-y-2"
          id="sign-in-form"
          noValidate
        >
          {(form?.formState?.errors?.email ||
            form?.formState?.errors?.password) && (
            <p className="text-destructive pb-2 text-sm">
              {t("auth.sign-in-error")}
            </p>
          )}
          <div className="w-full">
            <TextFormField
              name="email"
              label={t("common.email")}
              type="email"
            />
          </div>
          <div className="w-full">
            <TextFormField
              name="password"
              label={t("common.password")}
              type="password"
            />
          </div>
          <div>
            <ResetPasswordLink />
          </div>

          <Button
            className="my-4 w-full"
            type="submit"
            form="sign-in-form"
            disabled={isDisabled}
            loading={isDisabled}
          >
            {isDisabled ? t("common.please-wait") : t("auth.sign-in")}
          </Button>
        </form>
      </Form>
    </>
  );
}
