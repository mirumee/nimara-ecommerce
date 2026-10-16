import { z } from "zod";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { type GetTranslations } from "@nimara/i18n/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .email({ message: t("form-validation.invalid-email") })
      .trim()
      .max(FIELD_MAX_LENGTH.email, {
        message: t("form-validation.max-length", {
          maximum: FIELD_MAX_LENGTH.email,
        }),
      }),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
