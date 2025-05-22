"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { requestPasswordResetAction } from "@/app/[locale]/(auth)/reset-password/action";
import { TextFormField } from "@/components/form/text-form-field";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { useCurrentRegion } from "@/regions/client";
import { type GetTranslations } from "@/types";

const resetPasswordSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("form-validation.reset-password-required-email") })
      .email({ message: t("form-validation.invalid-email") })
      .trim(),
  });

type ResetPasswordSchema = z.infer<ReturnType<typeof resetPasswordSchema>>;

export function ResetPasswordForm() {
  const t = useTranslations();
  const [isSuccess, setIsSuccess] = useState(false);
  const region = useCurrentRegion();
  const { toast } = useToast();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema({ t })),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit: SubmitHandler<ResetPasswordSchema> = async ({
    email,
  }) => {
    const result = await requestPasswordResetAction({
      channel: region.market.channel,
      email,
    });

    if (!result.ok) {
      setIsSuccess(false);

      for (const error of result.errors) {
        if (error.field) {
          form.setError(error.field as keyof ResetPasswordSchema, {
            type: "manual",
            message: t(`errors.${error.code}`),
          });
        } else {
          toast({
            variant: "destructive",
            description: t(`errors.${error.code}`),
          });
        }
      }

      return;
    }

    setIsSuccess(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {isSuccess ? (
        <>
          <h1 className="text-2xl font-normal leading-8 text-stone-900">
            {t("auth.reset-password-link-sent")}
          </h1>
          <div>
            <p className="text-sm text-stone-700">
              {t("auth.reset-password-link-sent-description")}
            </p>
            <Button className="my-6 w-full" asChild>
              <Link href={paths.home.asPath()}>
                {t("common.back-to-homepage")}
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="w-10 p-0" size="icon">
              <Link href={paths.signIn.asPath()}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-normal leading-8 text-stone-900">
              {t("auth.reset-password")}
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-y-2"
              id="sign-in-form"
              noValidate
            >
              <div className="w-full">
                <TextFormField
                  name="email"
                  label={t("common.email")}
                  placeholder={t("auth.email-placeholder")}
                  type="email"
                />
              </div>

              <p className="text-sm text-stone-700">
                {t("auth.reset-password-description")}
              </p>
              <Button className="my-4 w-full" type="submit" form="sign-in-form">
                {t("auth.password-reset")}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
