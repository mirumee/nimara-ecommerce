"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";
import { TextFormField } from "@nimara/foundation/form-components/text-form-field";
import { cn } from "@nimara/foundation/lib/cn";
import { type MessagePath } from "@nimara/i18n/types";
import { Button } from "@nimara/ui/components/button";

import { useRouterWithState } from "@/foundation/use-router-with-state";

import {
  checkIfUserHasAnAccount,
  updateCheckoutUserDetailsAction,
} from "./actions";
import { maskEmail } from "./helpers/mask-email";
import { UserDetailsPasswordForm } from "./password-form";
import {
  type UserDetailsEmailFormSchema,
  userDetailsEmailFormSchema,
} from "./schema";

interface Props {
  checkout: Checkout;
  onComplete: () => void;
  user: User | null;
}

interface ActionError {
  code: string;
  field?: string | null;
}

export const UserDetailsForm = ({ checkout, user, onComplete }: Props) => {
  const t = useTranslations();
  const { isRedirecting } = useRouterWithState();
  const [userAccountEmail, setUserAccountEmail] = useState("");
  const [isContinuingAsGuest, setIsContinuingAsGuest] = useState(false);

  const form = useForm<UserDetailsEmailFormSchema>({
    resolver: zodResolver(userDetailsEmailFormSchema({ t })),
    defaultValues: {
      email: checkout.email ?? user?.email ?? "",
    },
  });

  const setFormErrors = (errors: ActionError[]) => {
    errors.forEach((error) => {
      const messageKey = `errors.${error.code}` as MessagePath;

      if (error.field) {
        form.setError(error.field as keyof UserDetailsEmailFormSchema, {
          message: t(messageKey),
        });
      } else {
        form.setError("root", {
          message: t(messageKey),
        });
      }
    });
  };

  const handleEmailSubmit = async ({ email }: UserDetailsEmailFormSchema) => {
    const checkResult = await checkIfUserHasAnAccount(email);

    if (checkResult.ok && checkResult.data.user) {
      setUserAccountEmail(checkResult.data.user.email);

      return;
    }

    const result = await updateCheckoutUserDetailsAction(
      {
        checkout,
        email,
      },
      {
        revalidateCheckoutPathOnSuccess: true,
      },
    );

    if (!result.ok) {
      setFormErrors(result.errors as ActionError[]);

      return;
    }

    onComplete();
  };

  const handleContinueAsGuest = async () => {
    if (!userAccountEmail) {
      return;
    }

    setIsContinuingAsGuest(true);

    const result = await updateCheckoutUserDetailsAction(
      {
        checkout,
        email: userAccountEmail,
      },
      {
        revalidateCheckoutPathOnSuccess: true,
      },
    );

    setIsContinuingAsGuest(false);

    if (!result.ok) {
      setFormErrors(result.errors as ActionError[]);

      return;
    }

    onComplete();
  };

  const handleUseDifferentEmail = () => {
    setUserAccountEmail("");
    form.reset({ email: "" });
    form.clearErrors();
  };

  const isDisabled =
    isRedirecting || form.formState.isSubmitting || isContinuingAsGuest;
  const rootError = form.formState.errors.root?.message;

  return (
    <section className="space-y-4">
      <h2 className="sr-only">{t("user-details.title")}</h2>
      {userAccountEmail ? (
        <div className="space-y-2">
          <h3 className="text-2xl tracking-tight">
            {t("checkout.hello-again")}
          </h3>
          <p>{maskEmail(userAccountEmail)}</p>
          <p>{t("checkout.sign-in-to-finalize-order")}</p>
          <UserDetailsPasswordForm
            checkout={checkout}
            userAccountEmail={userAccountEmail}
          />
          <div className="flex flex-col items-center">
            <Button
              variant="link"
              onClick={handleContinueAsGuest}
              disabled={isDisabled}
            >
              {t("auth.continue-as-guest")}
            </Button>
            <span className="cursor-default">{t("common.or")}</span>
            <Button variant="link" onClick={handleUseDifferentEmail}>
              {t("checkout.use-different-email")}
            </Button>
            {rootError && <p className="text-destructive">{rootError}</p>}
          </div>
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleEmailSubmit)}
            className="flex flex-col gap-y-2"
            id="checkout-user-details-email-form"
            noValidate
          >
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <TextFormField
                    isRequired
                    name="email"
                    type="email"
                    label={t("user-details.email")}
                  />
                </div>
                <Button
                  className={cn({
                    "mb-[1.813rem]": form.formState.errors.email,
                  })}
                  type="submit"
                  form="checkout-user-details-email-form"
                  disabled={isDisabled}
                  loading={isDisabled}
                >
                  {isDisabled ? t("common.saving") : t("common.continue")}
                </Button>
              </div>
            </div>
            {rootError && <p className="text-destructive">{rootError}</p>}
          </form>
        </FormProvider>
      )}
    </section>
  );
};
