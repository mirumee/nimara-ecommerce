import { type DeepNonNullable } from "ts-essentials";

import { type Maybe } from "@nimara/codegen/schema";
import { type Line, type PriceType } from "@nimara/domain/objects/common";

import { type CartLineFragment } from "#root/graphql/fragments/generated";
import { getTranslation } from "#root/lib/saleor";
import { serializeMoney } from "#root/store/saleor/serializers";

export const getVariantMaxQuantity = ({
  quantityAvailable,
  quantityLimitPerCustomer,
}: {
  quantityAvailable: Maybe<number>;
  quantityLimitPerCustomer: Maybe<number>;
}) => {
  if (quantityAvailable && quantityLimitPerCustomer) {
    return quantityAvailable < quantityLimitPerCustomer
      ? quantityAvailable
      : quantityLimitPerCustomer;
  }

  return quantityLimitPerCustomer ?? quantityAvailable ?? 0;
};

export const serializeLine = (
  line: CartLineFragment,
  priceType: PriceType,
): Line => {
  const {
    id,
    quantity,
    totalPrice,
    undiscountedTotalPrice,
    variant: {
      quantityLimitPerCustomer,
      quantityAvailable,
      product,
      ...variant
    },
  } = line as DeepNonNullable<CartLineFragment>;
  const thumbnail = variant.media?.[0] || product.thumbnail || null;

  return {
    id,
    quantity,
    thumbnail,
    total: { ...serializeMoney(totalPrice[priceType]), type: priceType },
    undiscountedTotalPrice: serializeMoney(undiscountedTotalPrice),
    variant: {
      maxQuantity: getVariantMaxQuantity({
        quantityLimitPerCustomer,
        quantityAvailable,
      }),
      id: variant.id,
      name: getTranslation("name", variant),
      sku: variant.sku,
    },
    product: {
      id: product.id,
      slug: product.slug,
      name: getTranslation("name", product),
    },
  };
};
