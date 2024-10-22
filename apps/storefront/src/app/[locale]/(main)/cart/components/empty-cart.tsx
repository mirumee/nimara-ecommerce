"use client";

import { useTranslations } from "next-intl";

import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const EmptyCart = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      <p className="text-2xl">{t("cart.empty")}</p>

      <p className="text-pri font-[400] text-stone-500">
        {t("site.checkout-out-store")}
      </p>

      <Link href={paths.home.asPath()}>
        <Button>{t("site.explore-our-store")}</Button>
      </Link>
    </div>
  );
};
