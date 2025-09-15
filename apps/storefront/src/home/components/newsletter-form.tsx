"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";
import { newsletterSubscribeAction } from "@/home/actions/newsletter-subscribe";
import {
  type NewsletterFormSchema,
  newsletterFormSchema,
} from "@/home/forms/schema";

export const Newsletter = () => {
  const t = useTranslations();
  const { toast } = useToast();

  const form = useForm<NewsletterFormSchema>({
    resolver: zodResolver(newsletterFormSchema({ t })),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const isPending = form.formState.isSubmitting;

  const handleSubmit: SubmitHandler<NewsletterFormSchema> = async (values) => {
    const result = await newsletterSubscribeAction(values);

    if (result.ok) {
      form.reset();

      toast({
        description: t("newsletter.subscribe-success"),
        position: "center",
      });
    } else {
      toast({
        description: t("newsletter.subscribe-error"),
        position: "center",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="bg-muted px-4 py-12 sm:px-6 lg:px-8 dark:bg-stone-900">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Mail className="text-muted-foreground mx-auto h-12 w-12" />
          <h2 className="text-foreground mt-2 text-3xl font-semibold sm:text-4xl">
            {t("newsletter.subscribe-title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t("newsletter.subscribe-description")}
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-8 items-start gap-4 sm:flex"
            noValidate
          >
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
          </form>
        </Form>
      </div>
    </section>
  );
};
