"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";

import { newsletterSubscribeAction } from "./action";
import { type FormSchema, formSchema } from "./schema";

export const Newsletter = () => {
  const t = useTranslations();
  const { toast } = useToast();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const isPending = form.formState.isSubmitting;

  const handleSubmit: SubmitHandler<FormSchema> = async (values) => {
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
    <section className="bg-muted rounded-md px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-800">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="dark:text-muted mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("newsletter.subscribe-title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
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
