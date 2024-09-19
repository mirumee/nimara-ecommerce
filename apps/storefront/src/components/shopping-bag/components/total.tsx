import { useTranslations } from "next-intl";

import {
  ShoppingBagPrice,
  type ShoppingBagPriceProps,
} from "./shopping-bag-price";

export const Total = (props: Pick<ShoppingBagPriceProps, "price">) => {
  const t = useTranslations("cart");

  return (
    <ShoppingBagPrice
      {...props}
      heading={t("total")}
      variant="primary"
      dataTestId="total"
    />
  );
};

Total.displayName = "Total";
