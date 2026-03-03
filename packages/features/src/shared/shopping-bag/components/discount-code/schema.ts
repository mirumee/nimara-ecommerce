import { z } from "zod";

import { type GetTranslations } from "@nimara/i18n/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    code: z
      .string()
      .min(1, { message: t("form-validation.enter-discount-code") })
      .trim(),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
