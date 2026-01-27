"use client";

import { useTranslations } from "next-intl";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

export interface EmptyCartProps {
  paths: {
    home: string;
  };
}

export const EmptyCart = ({ paths }: EmptyCartProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      <p className="text-2xl">{t("cart.empty")}</p>

      <p className="text-pri dark:text-muted-foreground font-[400] text-stone-500">
        {t("site.check-out-our-store")}
      </p>

      <LocalizedLink href={paths.home}>
        <Button>{t("site.explore-our-store")}</Button>
      </LocalizedLink>
    </div>
  );
};
