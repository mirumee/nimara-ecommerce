"use client";

import { createParser, parseAsString } from "nuqs";

import type {
  Attribute,
  AttributeType,
  AttributeValue,
} from "@nimara/domain/objects/Attribute";
import type { Cart } from "@nimara/domain/objects/Cart";
import type {
  ProductAvailability,
  ProductVariant,
} from "@nimara/domain/objects/Product";
import type { User } from "@nimara/domain/objects/User";

export type AttributeDetails = {
  name: string;
  slug: string;
  type: Attribute["type"];
  values: AttributeValue[];
};

export type ChosenAttribute = { slug: string; value: string };

export type AttributePickerProps = {
  availability: ProductAvailability;
  cart: Cart | null;
  user: (User & { accessToken: string | undefined }) | null;
  variants: ProductVariant[];
};

export const getVariantSelectionAttributes = (
  variantId: string,
  variants: ProductVariant[],
): ChosenAttribute[] => {
  const variant = variants.find(({ id }) => id === variantId);

  return (
    variant?.selectionAttributes
      .map(({ slug, values }) => {
        if (values.length) {
          return {
            slug,
            value: values[0].slug,
          };
        }

        return null;
      })
      .filter(Boolean) ?? []
  );
};

export const getParserForAttributeType = (type: AttributeType) => {
  switch (type) {
    case "MULTISELECT":
      return createParser({
        parse: (value: string) => (value ? value.split(",") : []),
        serialize: (values: string[]) => {
          if (!Array.isArray(values)) {
            return "";
          }

          return values.join(",");
        },
      }).withDefault([]);

    case "DROPDOWN":
    case "SWATCH":
      return parseAsString.withDefault("");

    default:
      return parseAsString.withDefault("");
  }
};

export const getAllNonSelectionAttributes = (variants: ProductVariant[]) => {
  const allNonSelectionAttributes: AttributeDetails[] = [];

  variants.forEach(({ nonSelectionAttributes }) => {
    nonSelectionAttributes.forEach(
      ({
        values,
        type,
        name,
        slug,
      }: {
        name: string;
        slug: string;
        type: Attribute["type"];
        values: AttributeValue[];
      }) => {
        if (slug && values?.length > 0) {
          const attributeMatch = allNonSelectionAttributes.find(
            (attribute) => attribute.slug === slug,
          );

          if (attributeMatch) {
            const currentValuesSlug = attributeMatch.values.map(
              ({ slug }) => slug,
            );

            const newValues = values.filter(
              ({ slug }) => !currentValuesSlug.includes(slug),
            );

            attributeMatch.values.push(...newValues);
          } else {
            allNonSelectionAttributes.push({
              slug,
              values: [...values],
              name,
              type,
            });
          }
        }
      },
    );
  });

  return allNonSelectionAttributes;
};

export const getAllSelectionAttributes = (variants: ProductVariant[]) => {
  const allSelectionAttributes: AttributeDetails[] = [];

  variants.forEach(({ selectionAttributes }) => {
    selectionAttributes.forEach(
      ({
        values,
        type,
        name,
        slug,
      }: {
        name: string;
        slug: string;
        type: Attribute["type"];
        values: AttributeValue[];
      }) => {
        if (slug && values?.length > 0) {
          const attributeMatch = allSelectionAttributes.find(
            (attribute) => attribute.slug === slug,
          );

          if (attributeMatch) {
            const currentValuesSlug = attributeMatch.values.map(
              ({ slug }) => slug,
            );

            const newValues = values.filter(
              ({ slug }) => !currentValuesSlug.includes(slug),
            );

            attributeMatch.values.push(...newValues);
          } else {
            allSelectionAttributes.push({
              slug,
              values: [...values],
              name,
              type,
            });
          }
        }
      },
    );
  });

  return allSelectionAttributes;
};

// ! currently unsued
export const isAttributeCombinationPossible = (
  allVariants: ProductVariant[],
  chosenAttributes: ChosenAttribute[],
) => {
  if (chosenAttributes.length < 1) {
    return true;
  }

  return allVariants.some((variant) =>
    chosenAttributes.every(({ slug, value }) => {
      const variantAttribute = variant.selectionAttributes.find(
        (attr) => attr.slug === slug,
      );

      return variantAttribute?.values.some(
        (attrValue) => attrValue.slug === value,
      );
    }),
  );
};

export const validateValue = (
  slug: string,
  value: unknown,
  allSelectionAttributes: Attribute[],
) => {
  const attribute = allSelectionAttributes.find((attr) => attr.slug === slug);

  if (!attribute) {
    return false;
  }

  if (attribute.type === "MULTISELECT") {
    return (
      Array.isArray(value) &&
      value.every((v) => attribute.values.some((av) => av.slug === v))
    );
  }

  return value === "" || attribute.values.some((av) => av.slug === value);
};
