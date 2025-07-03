"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

interface ShoppingBagIconProps extends PropsWithChildren {
  count?: number;
}

export const ShoppingBagIcon = ({
  children,
  count = 0,
}: ShoppingBagIconProps) => {
  const t = useTranslations("cart");

  return (
    <Button variant="ghost" size="icon" className="relative gap-1" asChild>
      <Link
        href={paths.cart.asPath()}
        aria-label={t("items-in-cart", { cartItems: count })}
      >
        <ShoppingBag className="h-4 w-4" />
        {children}
      </Link>
    </Button>
  );
};
