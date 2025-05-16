"use client";

import { useTranslations } from "next-intl";

import { type Price } from "@nimara/domain/objects/common";
import { cn } from "@nimara/ui/lib/utils";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

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
  const formatter = useLocalizedFormatter();

  const isPrimary = variant === "primary";

  return (
    <>
      {isPrimary && <hr className="border-stone-200" />}

      <div
        className={cn(
          "text-content flex justify-between text-sm text-stone-700",
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
              : formatter.price({ amount: price.amount })}
          </p>
        )}
        {discount?.amount && (
          <p>-{formatter.price({ amount: discount.amount })}</p>
        )}
      </div>
    </>
  );
};
