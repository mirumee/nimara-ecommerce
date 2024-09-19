"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type {
  Attribute,
  AttributeValue,
} from "@nimara/domain/objects/Attribute";
import type { Cart } from "@nimara/domain/objects/Cart";
import type {
  ProductAvailability,
  ProductVariant,
} from "@nimara/domain/objects/Product";
import type { User } from "@nimara/domain/objects/User";
import { Label } from "@nimara/ui/components/label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@nimara/ui/components/toggle-group";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { isVariantInStock } from "@/lib/product";

import { AddToBag } from "./add-to-bag";
import { VariantDropdown } from "./variant-dropdown";

type AttributeDetails = {
  name: string;
  slug: string;
  type: Attribute["type"];
  values: AttributeValue[];
};
type SelectionAttributeMap = AttributeDetails[];

type SelectedAttribute = { slug: string; value: string };

export const getIdFromHash = () => {
  const isOnServer = typeof window === "undefined";

  return isOnServer ? "" : location.hash.replace("#", "");
};

const generateFullAttributeMap = (variants: ProductVariant[]) => {
  const selectionAttributesMap: SelectionAttributeMap = [];

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
        if (slug && values) {
          const attributeMatch = selectionAttributesMap.find(
            (attribute) => attribute.slug === slug,
          );

          if (attributeMatch) {
            const currentValuesSlug = attributeMatch.values.map(
              ({ slug }) => slug,
            );

            const newValues = values.filter(
              ({ slug }) => !currentValuesSlug.includes(slug),
            );

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            attributeMatch.values.push(...newValues);
          } else {
            selectionAttributesMap.push({
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

  return selectionAttributesMap;
};

const narrowAttributeMapToSelectedAttributes = (
  variants: ProductVariant[],
  selectionAttributesMap: SelectionAttributeMap,
  selectedAttributes: SelectedAttribute[],
) => {
  selectedAttributes.forEach((_, i, array) => {
    let newValues: AttributeValue[] = [];
    const attributesRequirements = array.slice(0, i + 1);
    const selectionToUpdate = selectionAttributesMap[i + 1];

    if (!selectionToUpdate) {
      return;
    }

    variants.forEach(({ selectionAttributes }) => {
      const match = attributesRequirements.every((requirement) => {
        return selectionAttributes.some(({ values, slug }) => {
          const valuesSlug = values.map(({ slug }: { slug: string }) => slug);

          return (
            requirement.slug === slug && valuesSlug.includes(requirement.value)
          );
        });
      });

      if (match) {
        const attributes = selectionAttributes.filter(
          ({ slug, values }) =>
            selectionToUpdate.slug === slug && values.length,
        );

        if (attributes.length) {
          newValues.push(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            ...attributes
              .map(({ values }: { values: AttributeValue[] }) => values)
              .flat(),
          );
        }
      }
    });

    const attributeMatch = selectionAttributesMap.find(
      ({ slug }) => slug === selectionToUpdate.slug,
    );

    if (attributeMatch) {
      attributeMatch.values = [...newValues];
    }

    newValues = [];
  });
};

const generateSelectionAttributeMap = (
  variants: ProductVariant[],
  selectedAttributes: SelectedAttribute[],
): SelectionAttributeMap => {
  const selectionAttributesMap = generateFullAttributeMap(variants);

  narrowAttributeMapToSelectedAttributes(
    variants,
    selectionAttributesMap,
    selectedAttributes,
  );

  return selectionAttributesMap;
};

const generateSelectedMapForVariant = (
  variantId: string,
  variants: ProductVariant[],
): SelectedAttribute[] => {
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

type AttributePickerProps = {
  availability: ProductAvailability;
  cart: Cart | null;
  user: (User & { accessToken: string | undefined }) | null;
  variants: ProductVariant[];
};

export const VariantSelector = ({
  variants: productVariants,
  availability: {
    isAvailable: isProductAvailable,
    variants: variantsAvailability,
    startPrice,
  },
  cart,
  user,
}: AttributePickerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<
    SelectedAttribute[]
  >(generateSelectedMapForVariant(selectedVariantId, productVariants));
  const [selectionAttributesMap, setSelectionAttributesMap] =
    useState<SelectionAttributeMap>(
      generateSelectionAttributeMap(productVariants, selectedAttributes),
    );

  const startingPrice = startPrice;
  const selectedVariant = variantsAvailability
    ? variantsAvailability.find(({ id }) => id === selectedVariantId)
    : undefined;
  const isVariantAvailable = selectedVariant
    ? isVariantInStock(selectedVariant, cart?.lines)
    : isProductAvailable;

  const getPrice = () => {
    if (selectedVariant) {
      if (selectedVariant.price.amount === 0) {
        return t("common.free");
      }

      return formatter.price({ amount: selectedVariant.price.amount });
    }

    const hasFreeVariant = variantsAvailability.some(
      (variant) => variant.price.amount === 0,
    );

    if (hasFreeVariant || startingPrice.amount === 0) {
      return t("common.free");
    }

    return t("common.from-price", {
      price: formatter.price({ amount: startingPrice.amount }),
    });
  };

  useEffect(() => {
    const regeneratedSelectionAttributesMap = generateSelectionAttributeMap(
      productVariants,
      selectedAttributes,
    );

    if (selectedAttributes.length) {
      const variantWithSelectedAttributes = productVariants.filter((variant) =>
        variant.selectionAttributes.every(({ slug, values }) => {
          if (values.length) {
            const attributeMatch = selectedAttributes.find(
              (attribute) => slug === attribute.slug,
            );

            return attributeMatch?.value === values[0].slug;
          }

          return true;
        }),
      );

      if (variantWithSelectedAttributes) {
        setVariants(variantWithSelectedAttributes);
      }
    }

    setSelectionAttributesMap(regeneratedSelectionAttributesMap);
  }, [selectedAttributes]);

  useEffect(() => {
    if (selectedVariantId) {
      router.push(`${pathname}#${selectedVariantId}`, { scroll: false });
    } else if (getIdFromHash() && !selectedVariantId) {
      router.push(pathname, { scroll: false });
    }
  }, [selectedVariantId]);

  useEffect(() => {
    /**
     * Can't set this in initial useState due to hydration error
     */
    const variantId = getIdFromHash();

    // Check if the variant id exists in the product variants.
    const isVariantIdValid =
      productVariants.findIndex((v) => v.id === variantId) !== -1;

    if (variantId && isVariantIdValid) {
      setSelectedVariantId(variantId);
      setSelectedAttributes(
        generateSelectedMapForVariant(variantId, productVariants),
      );
    }
  }, []);

  return (
    <>
      <p className="pb-6 pt-2">{getPrice()}</p>

      <div className="[&>div]:pb-4" key={selectedVariantId}>
        {selectionAttributesMap.map(({ slug, name, values }, index) => {
          const arePreviousAttributesSelected =
            index < selectedAttributes.length + 1;
          const hasValues = values.length > 0;

          if (!(arePreviousAttributesSelected && hasValues)) {
            return null;
          }

          const defaultValue = selectedAttributes.find((val) => {
            if (val.slug === slug) {
              return values.some((v) => v.slug === val.value);
            }

            return false;
          })?.value;

          return (
            <div key={slug} className="flex flex-col gap-1.5">
              <Label id={`label-${slug}`}>{name}</Label>
              <ToggleGroup
                type="single"
                defaultValue={defaultValue}
                className="grid grid-cols-2 md:grid-cols-3"
                aria-labelledby={t("products.label-slug", { slug })}
                onValueChange={(valueSlug) => {
                  setVariants([]);
                  setSelectedVariantId("");
                  setSelectedAttributes((values) => {
                    if (index < values.length - 1) {
                      // Undo if someone selects one of the previous attribute.
                      values.splice(index, values.length - index, {
                        slug,
                        value: valueSlug,
                      });
                    } else if (valueSlug) {
                      // Insert new attribute choice.
                      values.splice(index, 1, { slug, value: valueSlug });
                    } else {
                      // Replace current attribute choice.
                      values.splice(index, 1);
                    }

                    return [...values];
                  });
                }}
              >
                {values.map(({ slug, name }) => (
                  <ToggleGroupItem variant="outline" key={slug} value={slug}>
                    {name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          );
        })}

        <div className="flex flex-col gap-1.5">
          <VariantDropdown
            key={selectedVariantId}
            variants={variants}
            onVariantSelect={setSelectedVariantId}
            selectedVariantId={selectedVariantId}
          />
        </div>
      </div>

      <AddToBag
        cart={cart}
        variantId={selectedVariantId}
        isVariantAvailable={isVariantAvailable}
        user={user}
      />
    </>
  );
};
