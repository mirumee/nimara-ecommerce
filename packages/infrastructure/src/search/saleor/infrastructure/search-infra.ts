import {
  type AttributeInput,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";
import { err, ok } from "@nimara/domain/objects/Result";

import { saleorCategoryService } from "#root/category/providers";
import { saleorCollectionService } from "#root/collection/providers";
import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_LARGE } from "#root/config";
import { graphqlClient } from "#root/graphql/client";
import type { SearchInfra } from "#root/use-cases/search/types";

import { searchProductSerializer } from "../../serializers";
import type { SaleorSearchServiceConfig } from "../../types";
import { SearchProductQueryDocument } from "../graphql/queries/generated";

export const saleorSearchInfra =
  ({
    apiURL,
    serializers,
    settings,
    logger,
  }: SaleorSearchServiceConfig): SearchInfra =>
  async (
    { query, after, before, sortBy, filters, limit, productIds },
    context,
  ) => {
    // Last and first cannot be combined in the same query
    const pageInfo = before
      ? { before, last: limit, first: undefined }
      : after
        ? { after, first: limit, last: undefined }
        : { first: limit, last: undefined };

    const rawFilters = { ...filters };

    const collectionSlugs = rawFilters.collection?.split(",") ?? [];
    const categorySlugs = rawFilters.category?.split(",") ?? [];

    delete rawFilters.collection;
    delete rawFilters.category;

    // TODO: Find a better way how to handle filters between providers
    const attributesFilter: AttributeInput[] | undefined = rawFilters
      ? Object.entries(rawFilters).map(([slug, value]) => ({
          slug,
          boolean: value === "true" ? true : undefined,
          values: value !== "true" ? [value] : undefined,
        }))
      : undefined;

    const collectionsResult = await saleorCollectionService({
      apiURI: apiURL,
      logger,
    }).getCollectionsIDsBySlugs({
      channel: context.channel,
      slugs: collectionSlugs,
    });

    const categoriesResult = await saleorCategoryService({
      apiURI: apiURL,
      logger,
    }).getCategoriesIDsBySlugs({ slugs: categorySlugs });

    try {
      logger.debug("Fetching the products from Saleor", {
        query,
        channel: context.channel,
      });

      const result = await graphqlClient(apiURL).execute(
        SearchProductQueryDocument,
        {
          variables: {
            after,
            before,
            channel: context.channel,
            ...(productIds?.length
              ? { where: { ids: productIds } }
              : {
                  filter: {
                    attributes: attributesFilter,
                    collections: collectionsResult.data,
                    categories: categoriesResult.data,
                  },
                }),
            languageCode: context.languageCode as LanguageCodeEnum,
            search: query,
            sortBy: settings.sorting.find(
              (conf) => conf.queryParamValue === sortBy,
            )?.saleorValue,
            thumbnailFormat: THUMBNAIL_FORMAT,
            thumbnailSize: THUMBNAIL_SIZE_LARGE,
            ...pageInfo,
          },
          options: {
            // FIXME: Temporarily hardcoded, should be coming from outer layer
            next: {
              tags: [`SEARCH:${context.channel}`],
              revalidate: 15 * 60,
            },
          },
          operationName: "SearchProductQuery",
        },
      );

      if (!result.ok) {
        logger.error("Failed to fetch products from Saleor", {
          result,
        });

        return result;
      }

      const products = result.data.products;

      if (!products) {
        return ok({
          results: [],
          pageInfo: {
            type: "cursor",
            after: null,
            before: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }

      const serializer = serializers?.search ?? searchProductSerializer;

      return ok({
        results: products.edges.map(({ node }) => serializer(node)),
        pageInfo: {
          type: "cursor",
          after: products.pageInfo.endCursor,
          before: products.pageInfo.startCursor,
          hasNextPage: products.pageInfo.hasNextPage ?? false,
          hasPreviousPage: products.pageInfo.hasPreviousPage ?? false,
        },
      });
    } catch (e) {
      logger.error("Unexpected error while fetching products from Saleor", {
        error: e,
      });

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected error while fetching products from Saleor",
        },
      ]);
    }
  };
