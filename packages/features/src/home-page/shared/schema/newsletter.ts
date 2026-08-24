import { z } from "zod";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { type GetTranslations } from "@nimara/i18n/types";

/**
 * No subscription provider is wired up yet, so nothing downstream dictates this
 * bound. It matches the account name limit to keep the storefront consistent.
 */
const MAX_NAME_LENGTH = 256;

export const formSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("form-validation.required") })
      .max(MAX_NAME_LENGTH, {
        message: t("form-validation.max-length", {
          maximum: MAX_NAME_LENGTH,
        }),
      }),
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
