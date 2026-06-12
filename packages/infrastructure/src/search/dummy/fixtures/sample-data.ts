import { type SortByOption } from "@nimara/domain/objects/Search";
import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import type { Facet } from "#root/use-cases/search/types";

/** Same-origin placeholder assets (next/image only allows saleor.cloud / buttercms hosts). */
const THUMBNAIL_URL = "/emails/product-placeholder.png";

/** Fixed timestamp keeps server-rendered sample data deterministic. */
const UPDATED_AT = new Date("2024-01-01T00:00:00.000Z");

const product = (
  id: string,
  name: string,
  slug: string,
  amount: number,
): SearchProduct => ({
  id,
  name,
  slug,
  currency: "USD",
  price: { amount, currency: "USD", type: "gross" },
  media: [{ alt: name, url: THUMBNAIL_URL }],
  thumbnail: { alt: name, url: THUMBNAIL_URL },
  updatedAt: UPDATED_AT,
});

export const SAMPLE_PRODUCTS: SearchProduct[] = [
  product("dummy-1", "Sample Tee", "sample-tee", 29),
  product("dummy-2", "Sample Hoodie", "sample-hoodie", 69),
  product("dummy-3", "Sample Cap", "sample-cap", 19),
  product("dummy-4", "Sample Mug", "sample-mug", 14),
  product("dummy-5", "Sample Tote", "sample-tote", 24),
  product("dummy-6", "Sample Sticker Pack", "sample-sticker-pack", 9),
  product("dummy-7", "Sample Notebook", "sample-notebook", 12),
  product("dummy-8", "Sample Bottle", "sample-bottle", 22),
];

export const SAMPLE_FACETS: Facet[] = [
  {
    slug: "category",
    type: "DROPDOWN",
    messageKey: "filters.category",
    choices: [
      { label: "Apparel", value: "apparel" },
      { label: "Accessories", value: "accessories" },
    ],
  },
  {
    slug: "color",
    type: "MULTISELECT",
    messageKey: "filters.color",
    choices: [
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
    ],
  },
];

export const SAMPLE_SORT_OPTIONS: SortByOption[] = [
  { value: "name-asc", messageKey: "search.name-asc" },
  { value: "price-asc", messageKey: "search.price-asc" },
  { value: "price-desc", messageKey: "search.price-desc" },
];
