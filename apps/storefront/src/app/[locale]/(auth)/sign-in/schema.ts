import { z } from "zod";

import { type GetTranslations } from "@/types";

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
