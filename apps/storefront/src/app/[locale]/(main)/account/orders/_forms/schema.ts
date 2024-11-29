import { z } from "zod";

import { type GetTranslations } from "@/types";

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    selectedLines: z
      .record(z.boolean())
      .refine(
        (selectedLines) =>
          Object.values(selectedLines).some((isSelected) => isSelected),
        { message: t("order.select-at-least-one-product") },
      ),
  });

export type FormSchema = z.infer<ReturnType<typeof formSchema>>;
