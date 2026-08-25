import { z } from "zod";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { type GetTranslations } from "@nimara/i18n/types";

export const userDetailsEmailFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("form-validation.required") })
      .email({ message: t("form-validation.invalid-email") })
      .trim()
      .max(FIELD_MAX_LENGTH.email, {
        message: t("form-validation.max-length", {
          maximum: FIELD_MAX_LENGTH.email,
        }),
      }),
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
