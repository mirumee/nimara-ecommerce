export const CATEGORY_FILTER_KEY = "category";
export const COLLECTION_FILTER_KEY = "collection";

/**
 * Filter keys every search provider resolves against the store taxonomy instead
 * of product attributes. A product attribute sharing one of these slugs would
 * shadow the real filter, so attribute-derived facets must never claim them.
 */
export const RESERVED_FILTER_KEYS: string[] = [
  CATEGORY_FILTER_KEY,
  COLLECTION_FILTER_KEY,
];
