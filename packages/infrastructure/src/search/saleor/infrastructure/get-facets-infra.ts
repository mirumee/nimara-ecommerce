import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import { ok } from "@nimara/domain/objects/Result";

import { saleorCategoryService } from "#root/category/providers";
import { saleorCollectionService } from "#root/collection/providers";
import { graphqlClient } from "#root/graphql/client";
import { getTranslation, isVendorOwned } from "#root/lib/saleor";
import { RESERVED_FILTER_KEYS } from "#root/use-cases/search/consts";
import type { FacetType, GetFacetsInfra } from "#root/use-cases/search/types";

import {
  FacetsQueryDocument,
  FacetsTaxonomyQueryDocument,
} from "../graphql/queries/generated";
import {
  buildCategoryFacet,
  buildCollectionFacet,
  buildFacetsWhere,
} from "../helpers";
import type { SaleorSearchServiceConfig } from "../types";

const ROOT_CATEGORY_LEVEL = 0;

export const saleorGetFacetsInfra =
  ({ apiURL, logger }: SaleorSearchServiceConfig): GetFacetsInfra =>
  async ({ filters, categoryScope, options }, context) => {
    const collectionSlugs = filters?.collection?.split(",") ?? [];
    const categorySlugs = categoryScope
      ? [categoryScope.slug]
      : (filters?.category?.split(",") ?? []);

    const categoryService = saleorCategoryService({ apiURI: apiURL, logger });
    const collectionService = saleorCollectionService({
      apiURI: apiURL,
      logger,
    });
    const client = graphqlClient(apiURL);

    const [collectionsResult, categoriesResult, taxonomyResult] =
      await Promise.all([
        collectionService.getCollectionsIDsBySlugs({
          channel: context.channel,
          slugs: collectionSlugs,
          options,
        }),
        categoryService.getCategoriesIDsBySlugs({
          slugs: categorySlugs,
          options,
        }),
        /**
         * Unfiltered on purpose: a reserved filter must stay clearable from the
         * panel, which also keeps this out of the selection-keyed FacetsQuery
         * cache entry.
         */
        client.execute(FacetsTaxonomyQueryDocument, {
          variables: {
            channel: context.channel,
            languageCode: context.languageCode as LanguageCodeEnum,
            categoryLevel: ROOT_CATEGORY_LEVEL,
          },
          options,
        }),
      ]);

    const taxonomy = taxonomyResult.ok ? taxonomyResult.data : null;

    const rootCategories =
      taxonomy?.categories?.edges.map(({ node }) => ({
        name: getTranslation("name", node),
        slug: node.slug,
      })) ?? [];

    const storeCollections =
      taxonomy?.collections?.edges
        .filter(({ node }) => !isVendorOwned(node))
        .map(({ node }) => ({
          name: getTranslation("name", node),
          slug: node.slug,
        })) ?? [];

    const result = await client.execute(FacetsQueryDocument, {
      variables: {
        channel: context.channel,
        languageCode: context.languageCode as LanguageCodeEnum,
        where: buildFacetsWhere({
          categoryIds: categoriesResult.data,
          collectionIds: collectionsResult.data,
        }),
      },
      options,
    });

    if (!result.ok) {
      return result;
    }

    const taxonomyFacets = [
      ...buildCategoryFacet(rootCategories),
      ...buildCollectionFacet(storeCollections),
    ];

    if (!result.data?.attributes?.edges) {
      return ok(taxonomyFacets);
    }

    const attributeFacets = result.data.attributes.edges
      .map(({ node: attribute }) => ({
        name: attribute.translation?.name ?? attribute.name ?? "",
        slug: attribute.slug,
        choices:
          attribute.choices?.edges.map(({ node: choice }) => ({
            label: choice.name ?? "",
            value: choice.slug ?? "",
          })) ?? [],
        type: String(attribute.inputType) as FacetType,
      }))
      .filter((facet) => !RESERVED_FILTER_KEYS.includes(facet.slug));

    return ok([...taxonomyFacets, ...attributeFacets]);
  };
