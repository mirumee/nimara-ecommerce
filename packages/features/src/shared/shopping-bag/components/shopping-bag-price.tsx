"use client";

import { useFormatter, useTranslations } from "next-intl";

import { type Price } from "@nimara/domain/objects/common";
import { cn } from "@nimara/ui/lib/utils";

export type ShoppingBagPriceProps = {
  dataTestId?: string;
  discount?: Price;
  heading: string;
  price?: Price;
  variant?: "secondary" | "primary";
};

export const ShoppingBagPrice = ({
  variant = "secondary",
  price,
  discount,
  heading,
  dataTestId,
}: ShoppingBagPriceProps) => {
  const t = useTranslations("common");
  const formatter = useFormatter();

  const isPrimary = variant === "primary";

  return (
    <>
      {isPrimary && <hr className="border-stone-200" />}

      <div
        className={cn(
          "text-content text-foreground flex justify-between text-sm",
          {
            "[&>*]:font-[650]": isPrimary,
          },
        )}
        data-testid={`shopping-bag-price-${dataTestId}`}
      >
        <p>{heading}</p>
        {price?.amount && (
          <p>
            {price.amount === 0
              ? t("free")
              : formatter.number(price.amount, {
                  style: "currency",
                  currency: price.currency,
                })}
          </p>
        )}
        {discount?.amount && (
          <p className="text-primary">
            -
            {formatter.number(discount.amount, {
              style: "currency",
              currency: discount.currency,
            })}
          </p>
        )}
      </div>
    </>
  );
};
