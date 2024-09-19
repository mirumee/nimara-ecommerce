import { z } from "zod";

import { type GetTranslations } from "@/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    code: z
      .string()
      .min(1, { message: t("form-validation.typeTheDiscount") })
      .trim(),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
