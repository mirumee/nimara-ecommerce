"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { AlertCircle, CheckIcon, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import type {
  Line as LineType,
  TaxedPrice,
} from "@nimara/domain/objects/common";
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
import { Sheet, SheetContent } from "@nimara/ui/components/sheet";
import { screenSizes } from "@nimara/ui/consts";
import { cn } from "@nimara/ui/lib/utils";

import { Price } from "@/components/price"; // Adjust the path as needed
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type LineQuantityChange = (lineId: string, quantity: number) => Promise<void>;

export type LineProps = {
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
}: LineProps) => {
  const [value, setValue] = useState(quantity.toString());
  const [isOpen, setIsOpen] = useState(false);
  const [showMaxQuantityWarning, setShowMaxQuantityWarning] = useState(false);
  const { width } = useWindowSize();
  const isSmDown = width && width < screenSizes.sm;

  const t = useTranslations();
  const inputValue = useDebounce(value, 1000);

  const attributeNames = variant.selectionAttributes
    ?.map((attr) => attr.values?.[0]?.name)
    .filter(Boolean)
    .join(" • ");

  const name = `${product.name}${attributeNames ? ` • ${attributeNames}` : ""}`;

  const href = paths.products.asPath({ slug: product.slug, hash: variant.id });

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

  useEffect(() => {
    if (value === quantity.toString()) {
      return;
    }
    let qty = Number(inputValue);

    if (inputValue === "" || isNaN(qty) || qty < 1) {
      setValue("1");
      qty = 1;

      return;
    }

    if (qty > variant.maxQuantity) {
      setValue(variant.maxQuantity.toString());
      qty = variant.maxQuantity;
      setShowMaxQuantityWarning(true);
    } else {
      setValue(qty.toString());
      if (qty < variant.maxQuantity) {
        setShowMaxQuantityWarning(false);
      }
    }

    void onLineQuantityChange?.(id, qty);
  }, [inputValue]);

  useEffect(() => {
    if (isOpen && !isSmDown) {
      setIsOpen(false);
    }
  }, [width]);

  return (
    <div className="grid grid-cols-12 grid-rows-2 items-start gap-2 md:grid-rows-1 md:items-center [&>*]:transition-colors">
      <div className="col-span-2 row-span-2 h-full p-[5px] md:row-span-1">
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
              className={cn(isOutOfStock && "grayscale")}
            />
          )}
        </LocalizedLink>
      </div>

      <div
        className={cn("col-span-9 md:col-span-5", {
          "md:col-span-6": !isLineEditable,
        })}
      >
        <LocalizedLink title={name} href={href} className="grow">
          <p
            className={cn("text-foreground text-sm", {
              "text-stone-400": isOutOfStock,
            })}
          >
            {name}
          </p>
        </LocalizedLink>
      </div>

      <div className="col-span-5 row-span-2 flex hidden items-center gap-2 md:col-span-2 md:row-span-1 md:flex">
        {isLineEditable ? (
          <>
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
              type="number appearance-none"
              disabled={isDisabled}
              value={value}
              onChange={(evt) => setValue(evt.target.value)}
              inputMode="numeric"
              data-testid="cart-product-line-qty"
              id={`${id}:qty`}
            />
          </>
        ) : (
          <p
            className="text-sm text-stone-700 dark:text-stone-300"
            data-testid="product-qty"
          >
            {t("common.qty")}: {value}
          </p>
        )}
      </div>

      <div className="col-span-5 row-span-2 flex items-center gap-2 md:col-span-2 md:row-span-1 md:hidden">
        {isLineEditable && (
          <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetContent
                side="bottom"
                className="max-h-[60vh] overflow-y-auto"
              >
                <ul>
                  {Array.from(
                    { length: variant.maxQuantity },
                    (_, i) => i + 1,
                  ).map((qty) => (
                    <li
                      key={id}
                      className="flex cursor-pointer"
                      onClick={() => {
                        handleQuantityChange(qty);
                        setIsOpen(false);
                      }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-1.5"
                      >
                        <CheckIcon
                          className={cn("invisible mr-2 h-auto w-[20px]", {
                            visible: qty === quantity,
                          })}
                        />
                        {qty}
                      </Button>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>

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
              onOpenChange={() => setIsOpen(true)}
              value={value}
              aria-expanded={isOpen}
              aria-controls="qty-select-options"
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
          </>
        )}
      </div>

      <div className="col-span-5 row-span-1 md:col-span-2">
        <p
          className={cn("flex justify-end text-stone-700 dark:text-stone-300", {
            "text-stone-400": isOutOfStock,
          })}
          data-testid="shopping-bag-product-line-price"
        >
          <Price
            price={finalLineTotal}
            undiscountedPrice={undiscountedLineTotal}
          />
        </p>
      </div>

      {isLineEditable && (
        <div className="col-start-12 col-end-12 row-start-1 row-end-1 flex items-center justify-center md:row-span-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            onClick={handleLineDelete}
            aria-label={t("cart.remove-button")}
          >
            <X height={16} width={16} />
          </Button>
        </div>
      )}
      {showMaxQuantityWarning && (
        <div className="col-span-12 mt-2 flex items-center gap-2 text-red-500">
          <AlertCircle size={16} />
          <span>
            {t("cart.max-quantity", { maxQuantity: variant.maxQuantity })}
          </span>
        </div>
      )}
    </div>
  );
};
