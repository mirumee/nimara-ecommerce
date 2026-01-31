"use client";

import { useFormatter, useTranslations } from "next-intl";

import { type ShoppingBagPriceProps } from "./shopping-bag-price";

type ShippingProps = Pick<ShoppingBagPriceProps, "price"> & {
  isShippingRequired: boolean;
  isShippingSelected: boolean;
};

export const Shipping = ({
  isShippingRequired,
  isShippingSelected,
  price,
}: ShippingProps) => {
  const t = useTranslations();
  const formatter = useFormatter();

  if (!isShippingRequired) {
    return null;
  }

  return (
    <div
      className="text-content text-foreground flex justify-between text-sm"
      data-testid="shopping-bag-price-delivery-method"
    >
      <p>{t("delivery-method.title")}</p>
      {isShippingSelected ? (
        <p>
          {price && price.amount > 0
            ? formatter.number(price.amount, {
                style: "currency",
                currency: price.currency,
              })
            : t("common.free")}
        </p>
      ) : (
        <p>-</p>
      )}
    </div>
  );
};

Shipping.displayName = "Shipping";
