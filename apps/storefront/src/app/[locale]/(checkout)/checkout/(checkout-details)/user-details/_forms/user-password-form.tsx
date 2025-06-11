"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { ResetPasswordLink } from "@/components/reset-password-link";
import { login } from "@/lib/actions/login";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import { type PasswordFormSchema, passwordFormSchema } from "./schema";

export const UserPasswordForm = ({
  userAccountEmail,
}: {
  userAccountEmail: string;
}) => {
  const t = useTranslations();

  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<PasswordFormSchema>({
    resolver: zodResolver(passwordFormSchema({ t })),
    defaultValues: {
      password: "",
    },
  });

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  const handleSubmit = async ({ password }: PasswordFormSchema) => {
    const data = await login({
      email: userAccountEmail,
      password,
      redirectUrl: paths.checkout.shippingAddress.asPath(),
    });

    if (data.redirectUrl) {
      push(data.redirectUrl);
    }

    if (data?.error) {
      form.setError("password", { message: t("auth.sign-in-error") });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 py-4"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="user-details-password-form"
        noValidate
      >
        <TextFormField
          name="password"
          label={t("common.password")}
          type="password"
        />
        <div>
          <ResetPasswordLink />
        </div>

        <Button
          type="submit"
          className="ml-2"
          form="user-details-password-form"
          disabled={isDisabled}
          loading={isDisabled}
        >
          {isDisabled ? t("common.please-wait") : t("common.continue")}
        </Button>
      </form>
    </Form>
  );
};
