import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import type {
  ButterCMSPageFields,
  PageField,
} from "@nimara/domain/objects/CMSPage";

import type { SelectionAttributeFragment } from "#root/public/saleor/store/graphql/fragments/generated";

import { getTranslation } from "../saleor";

const convertToDashedString = (input: string): string => {
  return input.replace(/[\s_]+/g, "-").trim();
};

export const parseDataToCMSFields = (
  fields: SelectionAttributeFragment[] | ButterCMSPageFields,
  source: "saleor" | "butterCms",
): PageField[] => {
  if (source === "saleor") {
    return (fields as SelectionAttributeFragment[]).map((field) => {
      const slug = field.attribute?.slug;
      const text =
        getTranslation("plainText", field.values?.[0]) ||
        field.values?.[0]?.value ||
        "";
      const imageUrl = field.values[0].file?.url;
      const references = field.values
        ?.map((value) => value.reference)
        .filter((ref) => ref !== null);

      return {
        slug,
        text,
        imageUrl,
        reference: references.length > 0 ? references : undefined,
      };
    });
  } else if (source === "butterCms") {
    const pageFields = fields as ButterCMSPageFields;

    return Object.keys(pageFields).map((key) => {
      const value = pageFields[key];
      let reference: string[] | undefined;

      if (Array.isArray(value)) {
        reference = value.map((item) => item.id).filter(Boolean);
      }

      return {
        slug: convertToDashedString(key),
        text: typeof value === "string" ? value : "",
        imageUrl:
          typeof value === "string" && value.startsWith("http")
            ? value
            : undefined,
        reference: reference?.length ? reference : undefined,
      };
    });
  }

  return [];
};

export const convertLanguageCode = (languageCode: LanguageCodeEnum): string => {
  return languageCode.toLowerCase().replace(/_/g, "");
};
