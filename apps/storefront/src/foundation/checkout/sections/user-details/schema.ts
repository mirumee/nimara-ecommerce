import { z } from "zod";

import { type GetTranslations } from "@nimara/i18n/types";

export const userDetailsEmailFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .email({ message: t("form-validation.invalid-email") })
      .min(1, { message: t("form-validation.required") })
      .trim(),
  });

export const userDetailsPasswordFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    password: z
      .string()
      .min(1, { message: t("auth.sign-in-error") })
      .trim(),
  });

export type UserDetailsEmailFormSchema = z.infer<
  ReturnType<typeof userDetailsEmailFormSchema>
>;

export type UserDetailsPasswordFormSchema = z.infer<
  ReturnType<typeof userDetailsPasswordFormSchema>
>;
