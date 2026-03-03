import { Truck, Undo2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type Product } from "@nimara/domain/objects/Product";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nimara/ui/components/alert";

type Props = {
  product: Product;
};

export const ProductHighlights = async (props: Props) => {
  const t = await getTranslations("products");

  const { hasFreeShipping, hasFreeReturn } = props.product.attributes.reduce(
    (acc, attr) => {
      if (attr.slug === "free-shipping" && attr.values.some((v) => v.boolean)) {
        acc.hasFreeShipping = true;
      }

      if (attr.slug === "free-return" && attr.values.some((v) => v.boolean)) {
        acc.hasFreeReturn = true;
      }

      return acc;
    },
    { hasFreeShipping: false, hasFreeReturn: false },
  );

  return (
    <>
      {hasFreeShipping && (
        <Alert className="text-primary">
          <Truck className="size-4" />
          <AlertTitle>{t("free-shipping")}</AlertTitle>
          <AlertDescription>{t("standard-parcel")}</AlertDescription>
        </Alert>
      )}

      {hasFreeReturn && (
        <Alert className="mt-2">
          <Undo2 className="size-4" />
          <AlertTitle>{t("free-30-days")}</AlertTitle>
        </Alert>
      )}
    </>
  );
};
