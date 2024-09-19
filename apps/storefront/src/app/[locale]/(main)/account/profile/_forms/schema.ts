import * as z from "zod";

import { MIN_PASSWORD_LENGTH } from "@/config";
import { type GetTranslations } from "@/types";

export const updateNameFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    firstName: z
      .string()
      .min(1, { message: t("form-validation.required") })
      .trim(),
    lastName: z
      .string()
      .min(1, { message: t("form-validation.required") })
      .trim(),
  });

export const updateEmailFormSchema = ({ t }: { t: GetTranslations }) =>
  z.object({
    email: z
      .string()
      .email({ message: t("form-validation.invalid-email") })
      .trim(),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: t("form-validation.min-length-password", {
          minimum: MIN_PASSWORD_LENGTH,
        }),
      })
      .trim(),
  });

export const updatePasswordFormSchema = ({ t }: { t: GetTranslations }) =>
  z
    .object({
      oldPassword: z.string().trim(),
      newPassword: z
        .string()
        .min(MIN_PASSWORD_LENGTH, {
          message: t("form-validation.min-length-password", {
            minimum: MIN_PASSWORD_LENGTH,
          }),
        })
        .trim(),
      confirm: z.string().trim(),
    })
    .refine((data) => data.newPassword === data.confirm, {
      message: t("form-validation.passwords-dont-match"),
      path: ["confirm"],
    });

export type UpdateNameFormSchema = z.infer<
  ReturnType<typeof updateNameFormSchema>
>;
export type UpdateEmailFormSchema = z.infer<
  ReturnType<typeof updateEmailFormSchema>
>;
export type UpdatePasswordFormSchema = z.infer<
  ReturnType<typeof updatePasswordFormSchema>
>;
