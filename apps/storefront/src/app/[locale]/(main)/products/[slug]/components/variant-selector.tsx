"use client";

import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";

import { Label } from "@nimara/ui/components/label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@nimara/ui/components/toggle-group";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { isVariantInStock } from "@/lib/product";
import { cn } from "@/lib/utils";

import { AddToBag } from "./add-to-bag";
import { VariantDropdown } from "./variant-dropdown";
import {
  type AttributePickerProps,
  getAllSelectionAttributes,
  getParserForAttributeType,
  validateValue,
} from "./variant-selector-utils";

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
  const t = useTranslations();
  const formatter = useLocalizedFormatter();
  // used to discriminate between variants when there are multiple variants with the same set of selection attributes
  const [discriminatedVariantId, setDiscriminatedVariantId] = useState("");

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

    return productVariants.filter((variant) =>
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
    );
  }, [params, productVariants, allSelectionAttributes]);

  const chosenVariant = discriminatedVariantId
    ? (productVariants.find(({ id }) => id === discriminatedVariantId) ?? null)
    : matchingVariants?.length === 1
      ? matchingVariants?.[0]
      : null;

  const chosenVariantAvailability = variantsAvailability
    ? variantsAvailability.find(({ id }) => id === chosenVariant?.id)
    : undefined;

  const isVariantAvailable =
    chosenVariant && chosenVariantAvailability
      ? isVariantInStock(chosenVariantAvailability, cart?.lines)
      : isProductAvailable;

  const getPrice = () => {
    if (chosenVariantAvailability) {
      if (chosenVariantAvailability.price.amount === 0) {
        return t("common.free");
      }

      return formatter.price({
        amount: chosenVariantAvailability.price.amount,
      });
    }

    const hasFreeVariant = variantsAvailability.some(
      (variant) => variant.price.amount === 0,
    );

    if (hasFreeVariant || startPrice.amount === 0) {
      return t("common.free");
    }

    return t("common.from-price", {
      price: formatter.price({ amount: startPrice.amount }),
    });
  };

  return (
    <>
      <p className="pb-6 pt-2">{getPrice()}</p>

      <div className="[&>div]:pb-4">
        {allSelectionAttributes.map(({ slug, name, values, type }, index) => {
          const isPreviousAttributeSelected =
            index === 0 ? true : !!chosenAttributes[index - 1]?.value;

          const chosenAttribute = chosenAttributes.find((val) => {
            if (val.slug === slug) {
              return values.some((v) => v.slug === val.value);
            }

            return false;
          });

          return (
            <div key={slug} className="flex flex-col gap-1.5">
              <Label id={`label-${slug}`}>
                {name}
                {type === "SWATCH" &&
                  !!chosenAttribute?.value &&
                  `: ${chosenAttribute.value}`}
              </Label>

              <ToggleGroup
                type="single"
                disabled={!isPreviousAttributeSelected}
                defaultValue={chosenAttribute?.value}
                className={cn(
                  type === "SWATCH"
                    ? "flex justify-start"
                    : "grid grid-cols-2 md:grid-cols-3",
                )}
                aria-labelledby={t("products.label-slug", { slug })}
                onValueChange={(valueSlug) => {
                  setDiscriminatedVariantId("");
                  setParams({
                    ...params,
                    [slug]: valueSlug,
                  }).catch((e) => {
                    console.error(e);
                  });
                }}
              >
                {values.map(({ slug: valueSlug, name: valueName, value }) => {
                  const isSelected = chosenAttributes.some(
                    (attr) => attr.slug === slug && attr.value === valueSlug,
                  );

                  return type === "SWATCH" ? (
                    <ToggleGroupItem
                      disabled={!isPreviousAttributeSelected}
                      variant="default"
                      key={valueSlug}
                      value={valueSlug}
                      className={cn(
                        cn(
                          "flex max-w-min flex-col hover:bg-transparent data-[state=on]:bg-transparent",
                        ),
                        !isPreviousAttributeSelected && "opacity-50",
                      )}
                      size="default"
                    >
                      <div
                        className={cn("h-6 w-6 border border-stone-200")}
                        style={{
                          backgroundColor: value,
                        }}
                      />

                      <div
                        className={cn(
                          "invisible mt-1 h-[2px] w-6 bg-black",
                          isSelected && "visible",
                        )}
                      ></div>
                    </ToggleGroupItem>
                  ) : (
                    <ToggleGroupItem
                      disabled={!isPreviousAttributeSelected}
                      variant="outline"
                      key={valueSlug}
                      value={valueSlug}
                    >
                      {valueName}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>
          );
        })}

        {matchingVariants?.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <VariantDropdown
              variants={matchingVariants}
              onVariantSelect={(variantId) => {
                setDiscriminatedVariantId(variantId);
              }}
              selectedVariantId={discriminatedVariantId}
            />
          </div>
        )}
      </div>

      <AddToBag
        cart={cart}
        variantId={
          matchingVariants?.length > 1
            ? discriminatedVariantId
            : chosenVariant
              ? chosenVariant?.id
              : areAllRequiredSelectionAttributesChosen
                ? "NOTIFY_ME"
                : ""
        }
        isVariantAvailable={
          matchingVariants?.length > 1
            ? true
            : chosenVariant
              ? isVariantAvailable
              : areAllRequiredSelectionAttributesChosen
                ? false
                : true
        }
        user={user}
      />
    </>
  );
};
