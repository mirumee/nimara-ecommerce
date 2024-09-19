import * as z from "zod";

import { type GetTranslations } from "@/types";

export const emailFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .email({ message: t("form-validation.invalid-email") })
      .trim(),
  });

export const passwordFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    password: z
      .string()
      .min(1, { message: t("auth.sign-in-error") })
      .trim(),
  });

export type EmailFormSchema = z.infer<ReturnType<typeof emailFormSchema>>;
export type PasswordFormSchema = z.infer<ReturnType<typeof passwordFormSchema>>;
