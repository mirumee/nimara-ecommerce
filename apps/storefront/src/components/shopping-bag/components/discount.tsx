import { useTranslations } from "next-intl";

import {
  ShoppingBagPrice,
  type ShoppingBagPriceProps,
} from "./shopping-bag-price";

export const Discount = (props: Pick<ShoppingBagPriceProps, "discount">) => {
  const t = useTranslations("cart");

  return <ShoppingBagPrice {...props} heading={t("discount")} />;
};
