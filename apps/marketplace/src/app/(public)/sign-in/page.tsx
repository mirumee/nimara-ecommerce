"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { InputField } from "@/components/fields/input-field";
import { PasswordField } from "@/components/fields/password-field";
import { useAuth } from "@/providers/auth-provider";

type SignInFormData = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const t = useTranslations();
  const signInSchema = z.object({
    email: z.string().email(t("marketplace.auth.validation-email-invalid")),
    password: z
      .string()
      .min(1, t("marketplace.auth.validation-password-required")),
  });
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const form = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(signInSchema),
  });

  const isPending = form.formState.isSubmitting || authLoading;

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      await login(data.email, data.password);
      router.push(redirectTo);
    } catch (error) {
      form.setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : t("marketplace.auth.sign-in-failed"),
      });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("marketplace.auth.sign-in-title")}</CardTitle>
        <CardDescription>
          {t("marketplace.auth.sign-in-description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form
            id="sign-in-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="flex flex-col gap-6">
              {form.formState.errors.root && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}
              <InputField
                name="email"
                label={t("common.email")}
                inputProps={{
                  placeholder: t("marketplace.auth.email-placeholder"),
                  autoComplete: "email",
                  type: "email",
                  disabled: isPending,
                }}
              />
              <PasswordField
                name="password"
                label={t("common.password")}
                inputProps={{
                  placeholder: t("marketplace.auth.password-placeholder"),
                  autoComplete: "current-password",
                  disabled: isPending,
                }}
              />
            </div>
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          type="submit"
          className="w-full"
          form="sign-in-form"
          disabled={isPending}
        >
          {isPending ? (
            <>
              {t("marketplace.auth.sign-in-title")}{" "}
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              {t("marketplace.auth.sign-in-title")}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <Link
          href="/sign-up"
          className="inline-block text-sm underline-offset-4 hover:underline"
        >
          {t("marketplace.auth.no-account-cta")}
        </Link>
      </CardFooter>
    </Card>
  );
}
