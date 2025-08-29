import type { PriceType, TaxedPrice } from "@nimara/domain/objects/common";

import { getTranslation } from "#root/lib/saleor";

import { serializeMoney } from "../../store/saleor/serializers";
import type { SearchProductSerializer } from "../types";

interface Variant {
  pricing: {
    price: { gross: TaxedPrice };
  };
}

export const searchProductSerializer: SearchProductSerializer = (data) => {
  const hasFreeVariants = data.variants.some(
    (variant: Variant) => variant.pricing.price.gross.amount === 0,
  );
  const taxType: PriceType = data.pricing.displayGrossPrices ? "gross" : "net";

  return Object.freeze({
    id: data.id,
    name: getTranslation("name", data),
    slug: data.slug,
    price: hasFreeVariants
      ? {
          amount: 0,
          currency: data.pricing?.priceRange?.start?.currency,
          type: taxType,
        }
      : {
          ...serializeMoney(
            data.pricing.priceRange?.start[taxType] as TaxedPrice,
          ),
          type: taxType,
        },

    currency: data.pricing?.priceRange?.start?.currency,
    undiscountedPrice: hasFreeVariants
      ? {
          amount: 0,
          currency: data.pricing?.priceRange?.start?.currency,
          type: taxType,
        }
      : {
          ...serializeMoney(
            data.pricing?.priceRangeUndiscounted?.start[taxType] as TaxedPrice,
          ),
          type: taxType,
        },

    thumbnail: data.thumbnail
      ? {
          url: data.thumbnail.url,
          alt: data.thumbnail.alt ?? data.name,
        }
      : null,
    media: Array.isArray(data.media)
      ? (data.media as { alt: string; url: string }[]).map((mediaItem) => ({
          url: mediaItem.url,
          alt: mediaItem.alt,
        }))
      : null,
    updatedAt: data.updatedAt,
  });
};
