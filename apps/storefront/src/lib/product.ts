import { type Line } from "@nimara/domain/objects/common";
import type { ProductVariantAvailability } from "@nimara/domain/objects/Product";

import type { Maybe } from "@/lib/types";

export const isVariantInStock = (
  variant: ProductVariantAvailability,
  lines: Maybe<Line[]>,
) => getVariantStock(variant, lines) > 0;

export const getVariantMaxQuantity = ({
  quantityAvailable,
  quantityLimitPerCustomer,
}: ProductVariantAvailability) => {
  if (quantityAvailable && quantityLimitPerCustomer) {
    return quantityAvailable < quantityLimitPerCustomer
      ? quantityAvailable
      : quantityLimitPerCustomer;
  }

  return quantityLimitPerCustomer ?? quantityAvailable ?? 0;
};

const getVariantStock = (
  variant: ProductVariantAvailability,
  lines: Maybe<Line[]>,
) => {
  const { id, quantityAvailable, quantityLimitPerCustomer } = variant;
  const checkoutQuantity = (
    lines?.filter((line) => line.variant.id === id) ?? []
  )
    .map((line) => line.quantity)
    .reduce((acc, val) => acc + val, 0);

  if (quantityAvailable) {
    if (quantityLimitPerCustomer) {
      const quantity = getVariantMaxQuantity(variant) - checkoutQuantity;

      return quantity > 0 ? quantity : 0;
    }

    return quantityAvailable - checkoutQuantity;
  }

  return 0;
};
