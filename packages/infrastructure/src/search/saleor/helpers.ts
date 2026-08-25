import { type AttributeWhereInput } from "@nimara/codegen/schema";

import {
  CATEGORY_FILTER_KEY,
  COLLECTION_FILTER_KEY,
} from "#root/use-cases/search/consts";
import { type Facet } from "#root/use-cases/search/types";

const STOREFRONT_ATTRIBUTES: AttributeWhereInput = {
  visibleInStorefront: true,
  type: { eq: "PRODUCT_TYPE" },
  withChoices: true,
};

const anyOf = (conditions: AttributeWhereInput[]): AttributeWhereInput =>
  conditions.length === 1 ? conditions[0] : { OR: conditions };

export const buildFacetsWhere = ({
  categoryIds,
  collectionIds,
}: {
  categoryIds?: string[] | null;
  collectionIds?: string[] | null;
}): AttributeWhereInput => {
  const scopes = [
    categoryIds?.length && anyOf(categoryIds.map((id) => ({ inCategory: id }))),
    collectionIds?.length &&
      anyOf(collectionIds.map((id) => ({ inCollection: id }))),
  ].filter((scope): scope is AttributeWhereInput => !!scope);

  if (!scopes.length) {
    return STOREFRONT_ATTRIBUTES;
  }

  return { AND: [STOREFRONT_ATTRIBUTES, ...scopes] };
};

/**
 * The reserved filters are offered from the catalog itself rather than from a
 * product attribute mirroring it, so adding a category or a collection in
 * Saleor is enough to make it filterable.
 */
type TaxonomyEntry = { name: string; slug: string };

const buildTaxonomyFacet = (
  slug: string,
  messageKey: string,
  entries: TaxonomyEntry[],
): Facet[] =>
  entries.length
    ? [
        {
          slug,
          messageKey,
          type: "MULTISELECT",
          choices: entries.map((entry) => ({
            label: entry.name,
            value: entry.slug,
          })),
        },
      ]
    : [];

export const buildCategoryFacet = (categories: TaxonomyEntry[]): Facet[] =>
  buildTaxonomyFacet(CATEGORY_FILTER_KEY, "filters.category", categories);

export const buildCollectionFacet = (collections: TaxonomyEntry[]): Facet[] =>
  buildTaxonomyFacet(COLLECTION_FILTER_KEY, "filters.collections", collections);
