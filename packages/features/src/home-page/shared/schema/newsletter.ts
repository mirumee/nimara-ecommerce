import * as z from "zod";

import { type GetTranslations } from "@nimara/i18n/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("form-validation.required") }),
    email: z.email({ message: t("form-validation.invalid-email") }).trim(),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
