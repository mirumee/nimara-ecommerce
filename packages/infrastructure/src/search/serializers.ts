import type { TaxedPrice } from "@nimara/domain/objects/common";

import { getTranslation } from "#root/lib/saleor";

import type { SearchProductSerializer } from "./types";

interface Variant {
  pricing: {
    price: { gross: TaxedPrice };
  };
}

export const searchProductSerializer: SearchProductSerializer = (data) => {
  const hasFreeVariants = data.variants.some(
    (variant: Variant) => variant.pricing.price.gross.amount === 0,
  );

  return Object.freeze({
    id: data.id,
    name: getTranslation("name", data),
    slug: data.slug,
    price: hasFreeVariants
      ? 0
      : Number(data.pricing?.priceRange?.start?.gross.amount),
    currency: data.pricing?.priceRange?.start?.currency,
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
