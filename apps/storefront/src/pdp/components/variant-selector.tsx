"use client";

import { useTranslations } from "next-intl";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { Label } from "@nimara/ui/components/label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@nimara/ui/components/toggle-group";

import { Price } from "@/components/price";
import { cn } from "@/lib/utils";

import { useVariantSelection } from "../hooks/useVariantSelection";
import { AddToBag } from "./add-to-bag";
import { VariantDropdown } from "./variant-dropdown";

type VariantSelectorProps = {
  cart: Cart | null;
  product: Product;
  productAvailability: ProductAvailability;
};

export const VariantSelector = ({
  product,
  productAvailability,
  cart,
}: VariantSelectorProps) => {
  const t = useTranslations();
  const {
    allSelectionAttributes,
    areAllRequiredSelectionAttributesChosen,
    chosenAttributes,
    chosenVariant,
    chosenVariantAvailability,
    discriminatedVariantId,
    isChosenVariantAvailable,
    matchingVariants,
    params,
    setDiscriminatedVariantId,
    setParams,
    startPrice,
    variantsAvailability,
  } = useVariantSelection({ cart, product, productAvailability });

  const hasFreeVariant = variantsAvailability?.some(
    (variant) => variant.price.amount === 0,
  );

  return (
    <>
      <p className="py-4 text-center text-lg md:text-left">
        <Price
          price={chosenVariantAvailability?.price}
          startPrice={startPrice}
          hasFreeVariants={hasFreeVariant}
          undiscountedPrice={chosenVariantAvailability?.priceUndiscounted}
        />
      </p>

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
              <Label id={`label-${slug}`} className="text-foreground">
                {name}
                {type === "SWATCH" &&
                  !!chosenAttribute?.value &&
                  `: ${chosenAttribute.value}`}
              </Label>

              <ToggleGroup
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                value={!chosenAttribute?.value ? null : chosenAttribute?.value}
                type="single"
                disabled={!isPreviousAttributeSelected}
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
                {values
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ slug: valueSlug, name: valueName, value }) => {
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
                            "bg-foreground invisible mt-1 h-[2px] w-6",
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
              ? isChosenVariantAvailable
              : areAllRequiredSelectionAttributesChosen
                ? false
                : true
        }
      />
    </>
  );
};
