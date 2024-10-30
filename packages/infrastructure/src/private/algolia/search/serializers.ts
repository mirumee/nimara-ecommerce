import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { type RecordSerializer } from "./types";

export const searchProductSerializer: RecordSerializer<SearchProduct> = (
  data,
) =>
  Object.freeze({
    currency: data.currency,
    id: data.objectID,
    productId: data.productId,
    name: data.productName,
    slug: data.slug,
    price: Number(data.grossPrice),
    thumbnail: data.thumbnail
      ? {
          url: data.thumbnail,
        }
      : null,
    media: Array.isArray(data.media)
      ? (data.media as { alt: string; url: string }[]).map((mediaItem) => ({
          url: mediaItem.url,
          alt: mediaItem.alt,
        }))
      : null,
  });
