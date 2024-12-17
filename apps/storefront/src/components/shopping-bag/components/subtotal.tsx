import { useTranslations } from "next-intl";

import {
  ShoppingBagPrice,
  type ShoppingBagPriceProps,
} from "./shopping-bag-price";

export const Subtotal = (props: Pick<ShoppingBagPriceProps, "price">) => {
  const t = useTranslations("cart");

  return (
    <ShoppingBagPrice
      {...props}
      heading={t("subtotal")}
      dataTestId="subtotal"
    />
  );
};