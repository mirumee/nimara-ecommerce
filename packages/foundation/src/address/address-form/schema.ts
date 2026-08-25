import { z } from "zod";

import { ALLOWED_COUNTRY_CODES, FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type GetTranslations } from "@nimara/i18n/types";

type BoundedFieldName = keyof typeof FIELD_MAX_LENGTH;

const boundedField = ({
  addressFormRows,
  fieldName,
  t,
}: {
  addressFormRows: readonly AddressFormRow[];
  fieldName: BoundedFieldName;
  t: GetTranslations;
}) =>
  z
    .string()
    .trim()
    .max(FIELD_MAX_LENGTH[fieldName], {
      message: t("form-validation.max-length", {
        maximum: FIELD_MAX_LENGTH[fieldName],
      }),
    })
    .optional()
    .superRefine(checkIfRequired({ addressFormRows, fieldName, t }));

export const addressSchema = ({
  addressFormRows,
  t,
}: {
  addressFormRows: readonly AddressFormRow[];
  t: GetTranslations;
}) =>
  z.object({
    country: z.enum(ALLOWED_COUNTRY_CODES),
    firstName: boundedField({ addressFormRows, fieldName: "firstName", t }),
    lastName: boundedField({ addressFormRows, fieldName: "lastName", t }),
    city: boundedField({ addressFormRows, fieldName: "city", t }),
    // Saleor validates the phone against the country's numbering plan, not a character count.
    phone: z
      .string()
      .trim()
      .optional()
      .superRefine(checkIfRequired({ addressFormRows, fieldName: "phone", t })),
    postalCode: boundedField({ addressFormRows, fieldName: "postalCode", t }),
    companyName: boundedField({ addressFormRows, fieldName: "companyName", t }),
    cityArea: boundedField({ addressFormRows, fieldName: "cityArea", t }),
    streetAddress1: boundedField({
      addressFormRows,
      fieldName: "streetAddress1",
      t,
    }),
    streetAddress2: boundedField({
      addressFormRows,
      fieldName: "streetAddress2",
      t,
    }),
    countryArea: boundedField({ addressFormRows, fieldName: "countryArea", t }),
  });

export const checkIfRequired =
  ({
    addressFormRows,
    fieldName,
    t,
  }: {
    addressFormRows: readonly AddressFormRow[];
    fieldName: string;
    t: GetTranslations;
  }) =>
  (arg: string | undefined, ctx: z.RefinementCtx) => {
    const foundField = addressFormRows
      .flat()
      .find((field) => field.name === fieldName);

    if (!foundField) {
      return;
    }
    if (foundField.isRequired && !arg) {
      ctx.addIssue({
        code: "invalid_type",
        path: [],
        fatal: true,
        message: t("form-validation.required"),
        expected: "string",
        received: typeof arg,
      });
    }

    if (foundField.matchers) {
      const isValid = foundField.matchers.some((matcher) =>
        new RegExp(matcher, "gi").test(arg as string),
      );

      if (!isValid) {
        ctx.addIssue({
          code: "custom",
          path: [],
          fatal: true,
          message: t("form-validation.wrong-code-format"),
        });
      }
    }
  };

export type AddressSchema = z.infer<ReturnType<typeof addressSchema>>;
