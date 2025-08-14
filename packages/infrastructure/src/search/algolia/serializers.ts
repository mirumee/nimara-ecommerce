import type { TaxedPrice } from "@nimara/domain/objects/common";
import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { type ProductHit, type RecordSerializer } from "./types";

export const searchProductSerializer: RecordSerializer<
  SearchProduct,
  ProductHit
> = (data) =>
  Object.freeze({
    currency: data.currency,
    id: data.productId,
    name: data.productName,
    slug: data.slug,
    price: {
      amount: Number(data.grossPrice),
      currency: data.currency,
    } as TaxedPrice,
    thumbnail: data.thumbnail
      ? {
          // INFO: just for demo purposes
          url: data.thumbnail.replace("=/256/", "=/1024/"),
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
