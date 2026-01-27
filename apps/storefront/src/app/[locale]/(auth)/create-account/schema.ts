import * as z from "zod";

import { type GetTranslations } from "@nimara/i18n/types";

import { MIN_PASSWORD_LENGTH } from "@/config";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, { message: t("form-validation.required") })
        .trim(),
      lastName: z
        .string()
        .min(1, { message: t("form-validation.required") })
        .trim(),
      email: z
        .email({ message: t("form-validation.invalid-email") })
        .min(1, { message: t("form-validation.email-required") })
        .trim(),
      password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, {
          message: t("form-validation.min-length-password", {
            minimum: MIN_PASSWORD_LENGTH,
          }),
        })
        .trim(),
      confirm: z.string().trim(),
    })
    .refine((data) => data.password === data.confirm, {
      message: t("form-validation.passwords-dont-match"),
      path: ["confirm"],
    });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
