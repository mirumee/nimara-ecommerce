import * as z from "zod";

import { type GetTranslations } from "@/types";

export const newsletterFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("form-validation.required") }),
    email: z
      .string()
      .min(1, { message: t("newsletter.email-required-newsletter") })
      .email({ message: t("form-validation.invalid-email") })
      .trim(),
  });

export type NewsletterFormSchema = z.infer<
  ReturnType<typeof newsletterFormSchema>
>;
