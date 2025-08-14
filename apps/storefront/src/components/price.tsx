"use client";
import { useTranslations } from "next-intl";

import type { TaxedPrice } from "@nimara/domain/objects/common";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

type Props = {
  className?: string;
  hasFreeVariants?: boolean;
  price?: TaxedPrice;
  startPrice?: TaxedPrice;
  undiscountedPrice?: TaxedPrice;
};

export const getDiscountInfo = (
  price?: TaxedPrice,
  undiscountedPrice?: TaxedPrice,
) => {
  const hasDiscount =
    price != null &&
    undiscountedPrice != null &&
    undiscountedPrice.amount > price.amount;

  const discountPercent = hasDiscount
    ? Math.round(
        ((undiscountedPrice.amount - price.amount) / undiscountedPrice.amount) *
          100,
      )
    : 0;

  return {
    hasDiscount,
    discountPercent,
    finalPrice: price,
    oldPrice: hasDiscount ? undiscountedPrice : null,
  };
};

export const Price = ({
  className,
  hasFreeVariants,
  price,
  startPrice,
  undiscountedPrice,
}: Props) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const renderPrice = (priceToFormat?: TaxedPrice) => {
    if (!priceToFormat || priceToFormat.amount === 0) {
      return t("common.free");
    }

    return formatter.price({ amount: priceToFormat.amount });
  };

  // A specific variant is selected (price is defined).
  if (price) {
    if (price.amount === 0) {
      return <span className={className}>{t("common.free")}</span>;
    }

    const { hasDiscount, oldPrice } = getDiscountInfo(price, undiscountedPrice);

    return (
      <span className={className}>
        {hasDiscount && oldPrice && (
          <span className="mr-2 text-gray-500 line-through dark:text-gray-400">
            {renderPrice(oldPrice)}
          </span>
        )}
        <span>{renderPrice(price)}</span>
      </span>
    );
  }

  // No specific variant is selected.
  if (hasFreeVariants) {
    return <span className={className}>{t("common.free")}</span>;
  }

  //  No free variants.
  if (startPrice) {
    return (
      <span className={className}>
        {startPrice.amount === 0
          ? t("common.free")
          : t("common.from-price", { price: renderPrice(startPrice) })}
      </span>
    );
  }

  return null;
};
