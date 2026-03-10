"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import { useToast } from "@nimara/ui/hooks";

import { InputField } from "@/components/fields/input-field";
import { PasswordField } from "@/components/fields/password-field";
import { TextareaField } from "@/components/fields/textarea-field";

import { registerAccount } from "./actions";

type SignUpFormData = {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  vatId: string;
  vendorDescription?: string;
  vendorName: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();
  const signUpSchema = z.object({
    email: z.string().email(t("marketplace.auth.validation-email-invalid")),
    password: z.string().min(8, t("marketplace.auth.validation-password-min")),
    firstName: z
      .string()
      .min(1, t("marketplace.auth.validation-first-name-required")),
    lastName: z
      .string()
      .min(1, t("marketplace.auth.validation-last-name-required")),
    vendorName: z
      .string()
      .min(1, t("marketplace.auth.validation-vendor-name-required")),
    companyName: z
      .string()
      .min(1, t("marketplace.auth.validation-company-name-required")),
    vatId: z.string().min(1, t("marketplace.auth.validation-vat-id-required")),
    vendorDescription: z.string().optional(),
  });
  const [success, setSuccess] = useState(false);

  const form = useForm<SignUpFormData>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      vendorName: "",
      companyName: "",
      vatId: "",
      vendorDescription: "",
    },
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try {
      const input = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        vendorName: data.vendorName,
        companyName: data.companyName,
        vatId: data.vatId,
        vendorDescription: data.vendorDescription ?? "",
        redirectUrl: `${window.location.origin}/account-confirm`,
        channel:
          process.env.NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG ??
          "default-channel",
      };

      const result = await registerAccount(input);

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message:
            result.errors[0]?.message ||
            t("marketplace.auth.registration-failed-try-again"),
        });

        return;
      }

      const payload = (result.data as any).accountRegister;

      if (payload?.errors?.length) {
        const error = payload.errors[0];
        const field = (
          error?.field != null ? String(error.field) : "root"
        ) as keyof SignUpFormData;
        const message =
          error?.message != null
            ? String(error.message)
            : t("marketplace.auth.registration-failed");

        form.setError(field, { type: "server", message });

        return;
      }

      toast({
        title: t("marketplace.auth.sign-up-button-label"),
        description: t("marketplace.auth.sign-up-description"),
      });

      if (payload?.requiresConfirmation) {
        setSuccess(true);
      } else {
        router.push("/sign-in?confirmed=true");
      }
    } catch (error) {
      form.setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : t("marketplace.auth.registration-failed-try-again"),
      });
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("marketplace.auth.sign-up-success-title")}</CardTitle>
          <CardDescription>
            {t("marketplace.auth.sign-up-success-description")}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              {t("marketplace.auth.back-to-sign-in")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("marketplace.auth.sign-up-title")}</CardTitle>
        <CardDescription>
          {t("marketplace.auth.sign-up-description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form
            id="sign-up-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="flex flex-col gap-4">
              {form.formState.errors.root && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="firstName"
                  label={t("marketplace.auth.label-first-name")}
                  inputProps={{
                    placeholder: t("marketplace.auth.placeholder-first-name"),
                    autoComplete: "given-name",
                    disabled: isPending,
                  }}
                />
                <InputField
                  name="lastName"
                  label={t("marketplace.auth.label-last-name")}
                  inputProps={{
                    placeholder: t("marketplace.auth.placeholder-last-name"),
                    autoComplete: "family-name",
                    disabled: isPending,
                  }}
                />
              </div>
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
                  autoComplete: "new-password",
                  disabled: isPending,
                }}
              />
              <InputField
                name="companyName"
                label={t("marketplace.auth.label-company-name")}
                inputProps={{
                  placeholder: t("marketplace.auth.placeholder-company-name"),
                  autoComplete: "organization",
                  disabled: isPending,
                }}
              />
              <InputField
                name="vatId"
                label={t("marketplace.auth.label-vat-id")}
                inputProps={{
                  placeholder: t("marketplace.auth.placeholder-vat-id"),
                  autoComplete: "vat",
                  disabled: isPending,
                }}
              />
              <InputField
                name="vendorName"
                label={t("marketplace.auth.label-vendor-name")}
                inputProps={{
                  placeholder: t("marketplace.auth.placeholder-vendor-name"),
                  autoComplete: "organization",
                  disabled: isPending,
                }}
              />
              <TextareaField
                name="vendorDescription"
                label={t("marketplace.auth.label-vendor-description")}
                textareaProps={{
                  placeholder: t(
                    "marketplace.auth.placeholder-vendor-description",
                  ),
                  disabled: isPending,
                  rows: 4,
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
          form="sign-up-form"
          disabled={isPending}
        >
          {isPending ? (
            <>
              {t("marketplace.auth.sign-up-button-creating")}{" "}
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              {t("marketplace.auth.sign-up-button-label")}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <Link
          href="/sign-in"
          className="inline-block text-sm underline-offset-4 hover:underline"
        >
          {t("marketplace.auth.already-have-account-cta")}
        </Link>
      </CardFooter>
    </Card>
  );
}
