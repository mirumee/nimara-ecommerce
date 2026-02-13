import * as z from "zod";

import { type GetTranslations } from "@nimara/i18n/types";

export const deliveryMethodSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    deliveryMethodId: z
      .string()
      .min(1, { message: t("form-validation.required") }),
  });

export type DeliveryMethodSchema = z.infer<
  ReturnType<typeof deliveryMethodSchema>
>;
