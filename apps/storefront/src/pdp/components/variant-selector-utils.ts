"use client";

import { createParser, parseAsString } from "nuqs";

import type {
  Attribute,
  AttributeType,
  AttributeValue,
} from "@nimara/domain/objects/Attribute";
import type { Image } from "@nimara/domain/objects/common";
import type { ProductVariant } from "@nimara/domain/objects/Product";

export type AttributeDetails = {
  name: string;
  slug: string;
  type: Attribute["type"];
  values: AttributeValue[];
};

export type ChosenAttribute = { slug: string; value: string };

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

export const getImagesToDisplay = ({
  chosenVariant,
  looselyMatchingVariants,
  productImages,
}: {
  chosenVariant: { images: Image[] } | null;
  looselyMatchingVariants: { images: Image[] }[];
  productImages: Image[];
}): Image[] => {
  if (chosenVariant?.images?.length) {
    return chosenVariant.images;
  }

  if (looselyMatchingVariants.length > 0) {
    const uniqueImages = looselyMatchingVariants
      .flatMap(({ images }) => images)
      .filter(
        (image, index, self) =>
          index === self.findIndex((i) => i.url === image.url),
      );

    if (uniqueImages.length) {
      return uniqueImages;
    }
  }

  if (productImages.length > 0) {
    return productImages;
  }

  return [];
};
