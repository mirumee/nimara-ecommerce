"use client";

import { useTranslations } from "next-intl";

import { type Price } from "@nimara/domain/objects/common";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { cn } from "@/lib/utils";

export const Header = ({
  header,
  totalPrice,
}: {
  header?: string;
  totalPrice?: Price;
}) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const headerTextClass = "text-2xl text-stone-700";

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
          {formatter.price({ amount: totalPrice.amount })}
        </p>
      )}
    </div>
  );
};
