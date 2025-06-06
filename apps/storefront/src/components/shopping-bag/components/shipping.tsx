"use client";

import { useTranslations } from "next-intl";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

import { type ShoppingBagPriceProps } from "./shopping-bag-price";

export const Shipping = (props: Pick<ShoppingBagPriceProps, "price">) => {
  const t = useTranslations();

  const formatter = useLocalizedFormatter();

  return (
    <div
      className="text-content flex justify-between text-sm text-stone-700"
      data-testid="shopping-bag-price-delivery-method"
    >
      <p>{t("delivery-method.title")}</p>
      <p>
        {props?.price && props.price.amount > 0
          ? formatter.price({ amount: props.price.amount })
          : t("common.free")}
      </p>
    </div>
  );
};

Shipping.displayName = "Shipping";
