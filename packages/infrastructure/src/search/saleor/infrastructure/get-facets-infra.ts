import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import { ok } from "@nimara/domain/objects/Result";

import { saleorCategoryService } from "#root/category/providers";
import { saleorCollectionService } from "#root/collection/providers";
import { type FetchOptions, graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
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
  async ({ filters }, context) => {
    const collectionSlugs = filters?.collection?.split(",") ?? [];
    const categorySlugs = filters?.category?.split(",") ?? [];

    const categoryService = saleorCategoryService({ apiURI: apiURL, logger });
    const collectionService = saleorCollectionService({
      apiURI: apiURL,
      logger,
    });
    const cacheOptions: FetchOptions = {
      next: {
        // FIXME: Temp value for now
        revalidate: 5 * 60,
        tags: ["SEARCH", "SEARCH:FACETS"],
      },
    };

    const client = graphqlClient(apiURL);

    const [collectionsResult, categoriesResult, taxonomyResult] =
      await Promise.all([
        collectionService.getCollectionsIDsBySlugs({
          channel: context.channel,
          slugs: collectionSlugs,
        }),
        categoryService.getCategoriesIDsBySlugs({ slugs: categorySlugs }),
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
          options: cacheOptions,
          operationName: "FacetsTaxonomyQuery",
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
        /**
         * A vendor-owned collection groups one vendor's own products, and the
         * marketplace mints one per vendor, so listing them store-wide would
         * grow without bound.
         */
        .filter(({ node }) => !node.vendorId?.trim())
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
      options: cacheOptions,
      operationName: "FacetsQuery",
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
