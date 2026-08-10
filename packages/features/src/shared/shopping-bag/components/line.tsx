"use client";

import { AlertCircle, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type {
  Line as LineType,
  TaxedPrice,
} from "@nimara/domain/objects/common";
import { Price } from "@nimara/features/shared/product/price";
import { ProductImagePlaceholder } from "@nimara/features/shared/product/product-image-placeholder";
import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import { cn } from "@nimara/ui/lib/utils";

type LineQuantityChange = (lineId: string, quantity: number) => Promise<void>;

export type LineProps = {
  getProductUrl?: (params: { slug: string; variantId: string }) => string;
  isDisabled?: boolean;
  isLineEditable?: boolean;
  isOutOfStock?: boolean;
  line: LineType;
  onLineDelete?(lineId: string): Promise<void>;
  onLineQuantityChange?: LineQuantityChange;
};

export const Line = ({
  line: {
    thumbnail,
    product,
    variant,
    id,
    quantity,
    undiscountedTotalPrice,
    total,
  },
  isDisabled,
  onLineQuantityChange,
  onLineDelete,
  isLineEditable = true,
  isOutOfStock = false,
  getProductUrl,
}: LineProps) => {
  const [value, setValue] = useState(quantity.toString());
  const [isOpen, setIsOpen] = useState(false);
  const [showMaxQuantityWarning, setShowMaxQuantityWarning] = useState(false);

  const t = useTranslations();

  const attributeNames = variant.selectionAttributes
    ?.map((attr) => attr.values?.[0]?.name)
    .filter(Boolean)
    .join(" • ");

  const name = `${product.name}${attributeNames ? ` • ${attributeNames}` : ""}`;

  const href = getProductUrl
    ? getProductUrl({ slug: product.slug, variantId: variant.id })
    : `/products/${product.slug}#${variant.id}`;

  const undiscountedLineTotal: TaxedPrice = {
    amount: undiscountedTotalPrice.amount,
    currency: undiscountedTotalPrice.currency,
    type: "gross",
  };

  const finalLineTotal: TaxedPrice = {
    amount: total.amount,
    currency: total.currency,
    type: "gross",
  };
  const handleLineDelete = async () => {
    await onLineDelete?.(id);
  };

  const handleQuantityChange = (qty: number) => {
    setValue(qty.toString());
    void onLineQuantityChange?.(id, qty);
    setIsOpen(false);
  };

  const handleInputChange = (nextValue: string) => {
    setValue(nextValue);

    const qty = Number(nextValue);

    if (nextValue === "" || isNaN(qty) || qty < 1) {
      return;
    }

    if (qty > variant.maxQuantity) {
      setShowMaxQuantityWarning(true);

      return;
    }

    setShowMaxQuantityWarning(false);
    void onLineQuantityChange?.(id, qty);
  };

  const handleInputBlur = () => {
    const qty = Number(value);

    if (value === "" || isNaN(qty) || qty < 1) {
      setValue(quantity.toString());
      setShowMaxQuantityWarning(false);

      return;
    }

    if (qty > variant.maxQuantity) {
      setValue(variant.maxQuantity.toString());
      void onLineQuantityChange?.(id, variant.maxQuantity);
    }
  };

  useEffect(() => {
    setValue(quantity.toString());
  }, [quantity]);

  return (
    <div className="w-full">
      <div className="flex w-full items-start gap-3 sm:items-center sm:gap-4 [&_*]:transition-colors">
        <div className="shrink-0">
          <LocalizedLink title={name} href={href}>
            {thumbnail ? (
              <Image
                src={thumbnail.url}
                alt={thumbnail.alt ?? name}
                sizes="56px"
                width={0}
                height={0}
                className={cn(
                  "h-[56px] w-[42px] object-cover",
                  isOutOfStock && "grayscale",
                )}
              />
            ) : (
              <ProductImagePlaceholder
                height={56}
                width={42}
                className={cn("h-[56px] w-[42px]", isOutOfStock && "grayscale")}
              />
            )}
          </LocalizedLink>
        </div>

        <div className="flex min-w-0 grow flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <LocalizedLink title={name} href={href} className="min-w-0 grow">
            <p
              className={cn("text-foreground text-sm break-words", {
                "text-stone-400": isOutOfStock,
              })}
            >
              {name}
            </p>
          </LocalizedLink>

          <div className="flex shrink-0 items-center gap-2">
            {isLineEditable ? (
              <>
                <div className="hidden items-center gap-2 md:flex">
                  <Label
                    className={cn(
                      isOutOfStock
                        ? "text-stone-500"
                        : "text-stone-700 dark:text-stone-300",
                    )}
                    htmlFor={`${id}:qty`}
                  >
                    {t("common.qty")}
                  </Label>
                  <Input
                    name={`${id}:qty`}
                    className={cn(
                      isOutOfStock
                        ? "text-stone-400"
                        : "text-stone-700 dark:text-stone-300",
                      "w-14",
                    )}
                    type="text"
                    disabled={isDisabled}
                    value={value}
                    onChange={(evt) => handleInputChange(evt.target.value)}
                    onBlur={handleInputBlur}
                    inputMode="numeric"
                    data-testid="cart-product-line-qty"
                    id={`${id}:qty`}
                  />
                </div>

                <div className="flex items-center gap-2 md:hidden">
                  <Label
                    className={cn(
                      isOutOfStock ? "text-stone-500" : "text-foreground",
                    )}
                    htmlFor={`${id}:qty`}
                  >
                    {t("common.qty")}
                  </Label>
                  <Select
                    disabled={isDisabled}
                    open={isOpen}
                    onValueChange={(qty) => handleQuantityChange(Number(qty))}
                    onOpenChange={setIsOpen}
                    value={value}
                  >
                    <SelectTrigger
                      className="w-auto gap-1 px-2"
                      aria-labelledby={`${id}:qty`}
                    >
                      <SelectValue placeholder={t("common.qty")} />
                    </SelectTrigger>
                    <SelectContent className="overflow-y-auto">
                      {Array.from(
                        { length: variant.maxQuantity },
                        (_, i) => i + 1,
                      ).map((qty) => (
                        <SelectItem key={qty} value={qty.toString()}>
                          {qty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <p
                className="text-sm whitespace-nowrap text-stone-700 dark:text-stone-300"
                data-testid="product-qty"
              >
                {t("common.qty")}: {value}
              </p>
            )}

            <p
              className={cn(
                "ml-auto flex min-w-[70px] justify-end whitespace-nowrap text-stone-700 dark:text-stone-300",
                { "text-stone-400": isOutOfStock },
              )}
              data-testid="shopping-bag-product-line-price"
            >
              <Price
                className="grid"
                price={finalLineTotal}
                undiscountedPrice={undiscountedLineTotal}
              />
            </p>

            {isLineEditable && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                disabled={isDisabled}
                onClick={handleLineDelete}
                aria-label={t("cart.remove-button")}
              >
                <X height={16} width={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {showMaxQuantityWarning && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-500">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            {t("cart.max-quantity", { maxQuantity: variant.maxQuantity })}
          </span>
        </div>
      )}
    </div>
  );
};
