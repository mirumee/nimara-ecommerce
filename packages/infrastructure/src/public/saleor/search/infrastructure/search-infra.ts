import {
  type AttributeInput,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";
import { err, ok } from "@nimara/domain/objects/Result";

import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_LARGE } from "#root/config";
import { graphqlClientV2 } from "#root/graphql/client";
import type { SearchInfra } from "#root/use-cases/search/types";

import { SearchProductQueryDocument } from "../graphql/queries/generated";
import { searchProductSerializer } from "../serializers";
import type { SaleorSearchServiceConfig } from "../types";

export const saleorSearchInfra =
  ({
    apiURL,
    serializers,
    settings,
    logger,
  }: SaleorSearchServiceConfig): SearchInfra =>
  async (
    {
      query,
      after,
      before,
      sortBy,
      filters,
      limit,
      productIds,
      category,
      collection,
    },
    context,
  ) => {
    // Last and first cannot be combined in the same query
    const pageInfo = before
      ? { before, last: limit, first: undefined }
      : after
        ? { after, first: limit, last: undefined }
        : { first: limit, last: undefined };
    // TODO: Find a better way how to handle filters between providers
    const attributesFilter: AttributeInput[] | undefined = filters
      ? Object.entries(filters).map(([slug, value]) => ({
          slug,
          boolean: value === "true" ? true : undefined,
          values: value !== "true" ? [value] : undefined,
        }))
      : undefined;

    try {
      logger.debug("Fetching the products from Saleor", {
        query,
        channel: context.channel,
        category,
        collection,
      });

      const result = await graphqlClientV2(apiURL).execute(
        SearchProductQueryDocument,
        {
          variables: {
            after,
            before,
            categorySlug: category ?? null,
            channel: context.channel,
            collectionSlug: collection ?? null,
            filter: {
              attributes: attributesFilter,
            },
            languageCode: context.languageCode as LanguageCodeEnum,
            search: query,
            searchByCategory: Boolean(category),
            searchByCollection: Boolean(collection),
            searchByProducts: !category && !collection,
            sortBy: settings.sorting.find(
              (conf) => conf.queryParamValue === sortBy,
            )?.saleorValue,
            where: productIds ? { ids: productIds } : undefined,
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

      const products =
        result.data?.category?.products ??
        result.data?.collection?.products ??
        result.data?.products;

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
          after: result.data.products?.pageInfo.endCursor,
          before: result.data.products?.pageInfo.startCursor,
          hasNextPage: result.data.products?.pageInfo.hasNextPage ?? false,
          hasPreviousPage:
            result.data.products?.pageInfo.hasPreviousPage ?? false,
        },
      });
    } catch (e) {
      logger.error("Unexpected error while fetching products from Saleor", {
        error: e,
      });

      return err({
        code: "UNEXPECTED_HTTP_ERROR",
        message: "Unexpected error while fetching products from Saleor",
      });
    }
  };
