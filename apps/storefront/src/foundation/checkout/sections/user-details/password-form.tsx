"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { TextFormField } from "@nimara/foundation/form-components/text-form-field";
import { Button } from "@nimara/ui/components/button";

import { login } from "@/foundation/auth/login";
import { ResetPasswordLink } from "@/foundation/auth/reset-password-link";
import { paths } from "@/foundation/routing/paths";
import { useRouterWithState } from "@/foundation/use-router-with-state";

import {
  type UserDetailsPasswordFormSchema,
  userDetailsPasswordFormSchema,
} from "./schema";

interface Props {
  checkout: Checkout;
  userAccountEmail: string;
}

export const UserDetailsPasswordForm = ({
  checkout,
  userAccountEmail,
}: Props) => {
  const t = useTranslations();
  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<UserDetailsPasswordFormSchema>({
    resolver: zodResolver(userDetailsPasswordFormSchema({ t })),
    defaultValues: {
      password: "",
    },
  });

  const isDisabled = isRedirecting || form.formState.isSubmitting;

  const handleSubmit = async ({ password }: UserDetailsPasswordFormSchema) => {
    const redirectStep = checkout.isShippingRequired
      ? "shipping-address"
      : "payment";
    const data = await login({
      email: userAccountEmail,
      password,
      redirectUrl: paths.checkout.asPath({
        query: { step: redirectStep },
      }),
    });

    if (data.redirectUrl) {
      push(data.redirectUrl);

      return;
    }

    if (data.error) {
      form.setError("password", { message: t("auth.sign-in-error") });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-4 py-4"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="checkout-user-details-password-form"
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
          form="checkout-user-details-password-form"
          disabled={isDisabled}
          loading={isDisabled}
        >
          {isDisabled ? t("common.please-wait") : t("common.continue")}
        </Button>
      </form>
    </FormProvider>
  );
};
