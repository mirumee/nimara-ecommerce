import * as z from "zod";

import { type GetTranslations } from "@nimara/foundation/i18n/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    deliveryMethodId: z
      .string()
      .min(1, { message: t("form-validation.required") }),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
