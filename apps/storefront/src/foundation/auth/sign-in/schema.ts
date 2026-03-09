import { z } from "zod/v3";

import { type GetTranslations } from "@nimara/i18n/types";

export const signInSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .email({ message: t("form-validation.invalid-email") })
      .trim(),
    password: z
      .string()
      .min(1, { message: t("form-validation.required") })
      .trim(),
  });

export type SignInSchema = z.infer<ReturnType<typeof signInSchema>>;
