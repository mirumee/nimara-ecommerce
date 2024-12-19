"use client";

import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { isVariantInStock } from "@/lib/product";

import {
  getAllSelectionAttributes,
  getParserForAttributeType,
  validateValue,
} from "../components/variant-selector-utils";

export const useVariantSelection = ({
  cart,
  product,
  productAvailability,
}: {
  cart: Cart | null;
  product: Product;
  productAvailability: ProductAvailability;
}) => {
  const [discriminatedVariantId, setDiscriminatedVariantId] = useState("");
  const productVariants = product?.variants;
  const variantsAvailability = productAvailability?.variants;

  const allSelectionAttributes = useMemo(
    () => getAllSelectionAttributes(productVariants),
    [productVariants],
  );

  const [params, setParams] = useQueryStates(
    Object.fromEntries(
      allSelectionAttributes.map((attr) => [
        attr.slug,
        getParserForAttributeType(attr.type),
      ]),
    ),
    {
      history: "replace",
    },
  );

  const chosenAttributes = useMemo(
    () =>
      Object.entries(params ?? {})
        .map(([slug, value]) => {
          return typeof value === "string" ? { slug, value } : null;
        })
        .filter(Boolean),
    [params],
  );

  useEffect(() => {
    if (!params) {
      return;
    }

    const validatedParams = Object.fromEntries(
      allSelectionAttributes.map((attr, index) => {
        const currentValue = params[attr.slug];

        if (!validateValue(attr.slug, currentValue, allSelectionAttributes)) {
          return [attr.slug, attr.type === "MULTISELECT" ? [] : ""];
        }

        return [
          attr.slug,
          index > 0 && params[allSelectionAttributes?.[index - 1]?.slug] === ""
            ? ""
            : currentValue,
        ];
      }),
    );

    // this selects only the first attribute's value if only one value is available
    if (
      allSelectionAttributes?.length > 0 &&
      allSelectionAttributes?.[0]?.values?.length === 1
    ) {
      validatedParams[allSelectionAttributes?.[0]?.slug] =
        allSelectionAttributes?.[0]?.values?.[0]?.slug;
    }

    if (JSON.stringify(params) !== JSON.stringify(validatedParams)) {
      setParams(validatedParams).catch((e) => {
        console.error(e);
      });
    }
  }, [
    params,
    allSelectionAttributes,
    setParams,
    setDiscriminatedVariantId,
    setParams,
  ]);

  const areAllRequiredSelectionAttributesChosen = allSelectionAttributes.every(
    ({ slug }) => {
      const value = params?.[slug];

      return value && (Array.isArray(value) ? value.length > 0 : value !== "");
    },
  );

  const matchingVariants = useMemo(() => {
    if (!areAllRequiredSelectionAttributesChosen) {
      return [];
    }

    return (
      productVariants?.filter((variant) =>
        variant.selectionAttributes.every(({ slug, values, type }) => {
          if (!values.length) {
            return true;
          }

          const selectedValue = params?.[slug];

          if (!selectedValue) {
            return false;
          }

          return type === "MULTISELECT"
            ? (selectedValue as string[]).every((v) =>
                values.some((attr) => attr.slug === v),
              )
            : values.some((v) => v.slug === selectedValue);
        }),
      ) ?? []
    );
  }, [params, productVariants, allSelectionAttributes]);

  const looselyMatchingVariants = useMemo(() => {
    return productVariants.filter(
      ({ selectionAttributes: productVariantSelectionAttributes }) => {
        return chosenAttributes.every(
          ({ slug: chosenAttributeSlug, value: chosenAttributeValue }) => {
            if (chosenAttributeValue === "") {
              return true;
            }

            return productVariantSelectionAttributes.some(
              (productVariantSelectionAttribute) => {
                return (
                  productVariantSelectionAttribute.slug ===
                    chosenAttributeSlug &&
                  productVariantSelectionAttribute.values.some((value) => {
                    return value.slug === chosenAttributeValue;
                  })
                );
              },
            );
          },
        );
      },
    );
  }, [chosenAttributes, productVariants]);

  const chosenVariant = discriminatedVariantId
    ? (productVariants?.find(({ id }) => id === discriminatedVariantId) ?? null)
    : matchingVariants?.length === 1
      ? matchingVariants?.[0]
      : null;

  const chosenVariantAvailability = variantsAvailability
    ? variantsAvailability.find(({ id }) => id === chosenVariant?.id)
    : undefined;

  const isChosenVariantAvailable =
    chosenVariant && chosenVariantAvailability
      ? isVariantInStock(chosenVariantAvailability, cart?.lines)
      : !!productAvailability?.isAvailable;

  return {
    allSelectionAttributes,
    areAllRequiredSelectionAttributesChosen,
    chosenAttributes,
    chosenVariant,
    chosenVariantAvailability,
    discriminatedVariantId,
    looselyMatchingVariants,
    isChosenVariantAvailable,
    matchingVariants,
    params,
    setDiscriminatedVariantId,
    setParams,
    startPrice: productAvailability?.startPrice,
    variantsAvailability,
  };
};
