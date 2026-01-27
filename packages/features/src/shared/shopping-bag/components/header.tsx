"use client";

import { useFormatter, useTranslations } from "next-intl";

import { type Price } from "@nimara/domain/objects/common";
import { cn } from "@nimara/ui/lib/utils";

export const Header = ({
  header,
  totalPrice,
}: {
  header?: string;
  totalPrice?: Price;
}) => {
  const t = useTranslations();
  const formatter = useFormatter();

  const headerTextClass = "text-2xl text-primary";

  return (
    <div
      className={cn("flex justify-between", {
        "justify-start gap-2 md:justify-between": totalPrice,
      })}
    >
      <h1 className={headerTextClass}>{header || t("cart.your-bag")}</h1>
      {totalPrice && (
        <p className={cn(headerTextClass, "block md:hidden")}>•</p>
      )}
      {totalPrice && (
        <p className={headerTextClass}>
          {formatter.number(totalPrice.amount, {
            style: "currency",
            currency: totalPrice.currency,
          })}
        </p>
      )}
    </div>
  );
};
