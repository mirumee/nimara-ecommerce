"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { TextFormField } from "@nimara/foundation/form-components/text-form-field";
import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { type FormSchema, formSchema } from "../schema/newsletter";
import { type NewsletterSubscribeAction } from "../types";

export const Newsletter = ({
  subscribeAction,
  privacyPolicyPath,
}: {
  privacyPolicyPath: string;
  subscribeAction: NewsletterSubscribeAction;
}) => {
  const t = useTranslations();
  const { toast } = useToast();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      name: "",
      email: "",
      consent: false,
    },
  });

  const isPending = form.formState.isSubmitting;

  const handleSubmit: SubmitHandler<FormSchema> = async (values) => {
    const result = await subscribeAction(values);

    if (result.ok) {
      form.reset();

      toast({
        description: t("newsletter.subscribe-success"),
        position: "center",
      });

      return;
    }

    toast({
      description: t(`errors.${result.errors[0].code}`),
      position: "center",
      variant: "destructive",
    });
  };

  return (
    <section className="bg-muted px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="text-foreground mt-2 text-3xl font-semibold sm:text-4xl">
            {t("newsletter.subscribe-title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t("newsletter.subscribe-description")}
          </p>
        </div>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-8"
            noValidate
          >
            <div className="items-start gap-4 sm:flex">
              <TextFormField
                name="name"
                label={t("newsletter.subscribe-name-field-label")}
                placeholder={t("newsletter.subscribe-name-field-placeholder")}
                type="text"
                disabled={isPending}
              />
              <TextFormField
                name="email"
                label={t("newsletter.subscribe-email-field-label")}
                placeholder={t("newsletter.subscribe-email-field-placeholder")}
                type="email"
                disabled={isPending}
              />
              <div className="mt-3 sm:mt-8">
                <Button type="submit" disabled={isPending} loading={isPending}>
                  {t("newsletter.subscribe-cta")}
                </Button>
              </div>
            </div>
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="grid gap-2 pt-4">
                  <div className="flex items-start gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                        disabled={isPending}
                        id="newsletter-consent"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="newsletter-consent"
                      className="text-sm font-normal"
                    >
                      {t.rich("newsletter.consent-label", {
                        privacyPolicy: (chunks: ReactNode) => (
                          <LocalizedLink
                            href={privacyPolicyPath}
                            className="underline decoration-gray-400 underline-offset-2"
                          >
                            {chunks}
                          </LocalizedLink>
                        ),
                      })}
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-muted-foreground mt-4 text-sm">
              {t("newsletter.confirmation-notice")}
            </p>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};
