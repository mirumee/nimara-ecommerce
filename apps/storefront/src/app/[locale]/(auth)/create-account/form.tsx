"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { MIN_PASSWORD_LENGTH } from "@/config";
import { Link } from "@/i18n/routing";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import { registerAccount } from "./actions";
import { type FormSchema, formSchema } from "./schema";

export function SignUpForm() {
  const t = useTranslations();

  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const isDisabled = isRedirecting || form.formState?.isSubmitting;

  async function handleSubmit(values: FormSchema) {
    const result = await registerAccount(values);

    if (result.ok) {
      push(paths.createAccount.asPath({ query: { success: "true" } }));

      return;
    }

    result.errors.forEach((error) => {
      if (error.field) {
        form.setError(error.field as keyof FormSchema, {
          message: t(`errors.${error.code}`),
        });
      } else {
        form.setError("email", {
          message: t(`errors.${error.code}`),
        });
      }
    });

    return;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-2"
        id="create-account-form"
        noValidate
      >
        <div className="flex gap-4">
          <div className="w-1/2">
            <TextFormField
              name="firstName"
              label={t("common.first-name")}
              autoComplete="given-name"
            />
          </div>
          <div className="w-1/2">
            <TextFormField
              name="lastName"
              label={t("common.last-name")}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="w-full">
          <TextFormField
            name="email"
            label={t("common.email")}
            placeholder={t("auth.email-placeholder")}
            type="email"
          />
        </div>
        <div className="w-full">
          <TextFormField
            name="password"
            label={t("common.password")}
            type="password"
            placeholder={t("auth.password-placeholder", {
              minPasswordLength: MIN_PASSWORD_LENGTH,
            })}
          />
        </div>
        <div className="w-full">
          <TextFormField
            name="confirm"
            label={t("auth.confirm-password")}
            type="password"
          />
        </div>
        <div className="mt-7">
          <p className="text-sm text-stone-700">
            {t.rich("auth.create-account-agreement", {
              termsOfUse: () => (
                <Link
                  href={paths.termsOfUse.asPath()}
                  className="underline decoration-gray-400 underline-offset-2"
                >
                  {t("common.terms-of-use")}
                </Link>
              ),
              privacyPolicy: () => (
                <Link
                  href={paths.privacyPolicy.asPath()}
                  className="underline decoration-gray-400 underline-offset-2"
                >
                  {t("common.privacy-policy")}
                </Link>
              ),
            })}
          </p>
        </div>
        <Button
          className="my-4 w-full"
          type="submit"
          form="create-account-form"
          disabled={isDisabled}
          loading={isDisabled}
        >
          {t("auth.create-account")}
        </Button>
      </form>
    </Form>
  );
}
