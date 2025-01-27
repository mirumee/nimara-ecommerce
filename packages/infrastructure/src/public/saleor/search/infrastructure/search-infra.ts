import {
  type AttributeInput,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";
import type { SearchInfra } from "#root/use-cases/search/types";

import { SearchProductQueryDocument } from "../graphql/queries/generated";
import { searchProductSerializer } from "../serializers";
import type { SaleorSearchServiceConfig } from "../types";

export const saleorSearchInfra =
  ({ apiURL, serializers, settings }: SaleorSearchServiceConfig): SearchInfra =>
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
      loggingService.debug("Fetching the products from Saleor", {
        query,
        channel: context.channel,
        category,
        collection,
      });

      const { data, error } = await graphqlClient(apiURL).execute(
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
            ...pageInfo,
          },
          options: {
            // FIXME: Temporarily hardcoded, should be coming from outer layer
            next: {
              tags: [`SEARCH:${context.channel}`],
              revalidate: 15 * 60,
            },
          },
        },
      );

      if (error) {
        loggingService.error("Failed to fetch products from Saleor", {
          error,
        });

        return {
          results: [],
          error,
        };
      }

      const products =
        data?.category?.products ??
        data?.collection?.products ??
        data?.products;

      if (!products) {
        return {
          results: [],
          error: null,
        };
      }

      const serializer = serializers?.search ?? searchProductSerializer;

      return {
        results: products.edges.map(({ node }) => serializer(node)),
        error: null,
        pageInfo: {
          type: "cursor",
          after: products.pageInfo.endCursor,
          before: products.pageInfo.startCursor,
          hasNextPage: products.pageInfo.hasNextPage,
          hasPreviousPage: products.pageInfo.hasPreviousPage,
        },
      };
    } catch (e) {
      loggingService.error(
        "Unexpected error while fetching products from Saleor",
        {
          error: e,
        },
      );

      return {
        results: [],
        error: e,
      };
    }
  };
