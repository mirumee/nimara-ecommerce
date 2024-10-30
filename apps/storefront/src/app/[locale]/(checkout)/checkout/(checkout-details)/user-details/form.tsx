"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { Checkout } from "@nimara/domain/objects/Checkout";

import { useRouterWithState } from "@/lib/hooks";

import { updateUserDetails } from "./_forms/actions";
import { UserEmailForm } from "./_forms/email-form";
import { UserPasswordForm } from "./_forms/password-form";
import { type EmailFormSchema, emailFormSchema } from "./_forms/schema";

export const UserDetailsForm = ({ checkout }: { checkout: Checkout }) => {
  const t = useTranslations();
  const { isRedirecting, push } = useRouterWithState();

  const [userAccountEmail, setUserAccountEmail] = useState("");
  const [emailName, domain] = userAccountEmail.split("@");

  const emailForm = useForm<EmailFormSchema>({
    resolver: zodResolver(emailFormSchema({ t })),
    defaultValues: {
      email: checkout.email ?? "",
    },
  });

  function handleDifferentEmail() {
    setUserAccountEmail("");
    emailForm.setValue("email", "");
  }

  const handleUpdateUserDetails = async () => {
    const result = await updateUserDetails({
      checkout,
      email: userAccountEmail,
    });

    if (result.redirectUrl) {
      push(result.redirectUrl);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="sr-only">{t("user-details.title")}</h2>
      {userAccountEmail ? (
        <div className="space-y-2">
          <h3 className="text-2xl tracking-tight">
            {t("checkout.hello-again")}
          </h3>
          <p>
            {emailName.length <= 3
              ? "*********"
              : emailName.replace(/(.{2}).*(.{2})/, "*********")}
            {emailName.slice(-2)}@{domain}
          </p>
          <p>{t("checkout.sign-in-to-finalize-order")}</p>
          <UserPasswordForm userAccountEmail={userAccountEmail} />
          <div className="flex flex-col items-center">
            <button
              className="hover:underline"
              onClick={handleUpdateUserDetails}
              disabled={isRedirecting}
            >
              {t("auth.continue-as-guest")}
            </button>
            <span className="cursor-default">{t("common.or")}</span>
            <button className="hover:underline" onClick={handleDifferentEmail}>
              {t("checkout.use-different-email")}
            </button>
          </div>
        </div>
      ) : (
        <UserEmailForm
          form={emailForm}
          checkout={checkout}
          setUserAccountEmail={setUserAccountEmail}
        />
      )}
    </section>
  );
};
