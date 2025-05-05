import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import type {
  ButterCMSPageFields,
  PageField,
} from "@nimara/domain/objects/CMSPage";

import type { SelectionAttributeFragment } from "../../store/saleor/graphql/fragments/generated.ts";
import { getTranslation } from "../saleor";

const convertToDashedString = (input: string): string => {
  return input.replace(/[\s_]+/g, "-").trim();
};

export const parseSaleorDataToFields = (
  fields: SelectionAttributeFragment[],
): PageField[] => {
  return fields.map((field) => {
    const slug = field.attribute?.slug;
    const firstValue = field.values?.[0];

    const text =
      getTranslation("plainText", firstValue) || firstValue?.value || "";
    const imageUrl = firstValue?.file?.url;
    const references = field.values
      ?.map((value) => value.reference)
      .filter((ref): ref is string => ref !== null);

    return {
      slug,
      text,
      imageUrl,
      reference: references?.length ? references : undefined,
    };
  });
};

export const parseButterCMSDataToFields = (
  fields: ButterCMSPageFields,
): PageField[] => {
  const pageFields = fields;

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
};

export const convertLanguageCode = (languageCode: LanguageCodeEnum): string => {
  return languageCode.toLowerCase().replace(/_/g, "");
};
