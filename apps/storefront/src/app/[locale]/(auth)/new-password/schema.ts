import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "@/config";
import { type GetTranslations } from "@/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z
    .object({
      password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, {
          message: t("form-validation.min-length-password", {
            minimum: MIN_PASSWORD_LENGTH,
          }),
        })
        .trim(),
      confirm: z
        .string({ required_error: t("form-validation.required") })
        .trim(),
    })
    .refine((data) => data.password === data.confirm, {
      message: t("form-validation.passwords-dont-match"),
      path: ["confirm"],
    });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
