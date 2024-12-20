import {
  type AttributeInput,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";
import type { SearchInfra } from "#root/use-cases/search/types";

import {
  SearchProductByCategoryQueryDocument,
  SearchProductByCollectionQueryDocument,
  SearchProductQueryDocument,
} from "../graphql/queries/generated";
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
    const pageInfo = before
      ? { before, last: limit }
      : after
        ? { after, first: limit }
        : { first: limit };
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
      });

      if (category) {
        const { data, error } = await graphqlClient(apiURL).execute(
          SearchProductByCategoryQueryDocument,
          {
            variables: {
              slug: category,
              channel: context.channel,
              languageCode: context.languageCode as LanguageCodeEnum,
              sortBy: settings.sorting.find(
                (conf) => conf.queryParamValue === sortBy,
              )?.saleorValue,
              filter: {
                attributes: attributesFilter,
              },
              ...pageInfo,
            },
            options: {
              next: {
                tags: [`SEARCH:${context.channel}`],
                revalidate: 15 * 60,
              },
            },
          },
        );

        if (error) {
          loggingService.error(
            "Failed to fetch category products from Saleor",
            {
              error,
            },
          );

          return {
            results: [],
            error,
          };
        }

        const products = data?.category?.products;

        if (!data || !products) {
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
      } else if (collection) {
        const { data, error } = await graphqlClient(apiURL).execute(
          SearchProductByCollectionQueryDocument,
          {
            variables: {
              slug: collection,
              channel: context.channel,
              languageCode: context.languageCode as LanguageCodeEnum,
              sortBy: settings.sorting.find(
                (conf) => conf.queryParamValue === sortBy,
              )?.saleorValue,
              filter: {
                attributes: attributesFilter,
              },
              ...pageInfo,
            },
            options: {
              next: {
                tags: [`SEARCH:${context.channel}`],
                revalidate: 15 * 60,
              },
            },
          },
        );

        if (error) {
          loggingService.error(
            "Failed to fetch collection products from Saleor",
            {
              error,
            },
          );

          return {
            results: [],
            error,
          };
        }

        const products = data?.collection?.products;

        if (!data || !products) {
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
      } else {
        const { data, error } = await graphqlClient(apiURL).execute(
          SearchProductQueryDocument,
          {
            variables: {
              search: query,
              where: productIds ? { ids: productIds } : undefined,
              channel: context.channel,
              languageCode: context.languageCode as LanguageCodeEnum,
              sortBy: settings.sorting.find(
                (conf) => conf.queryParamValue === sortBy,
              )?.saleorValue,
              filter: {
                attributes: attributesFilter,
              },
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
          loggingService.error("Failed to fetch the products from Saleor", {
            error,
          });

          return {
            results: [],
            error,
          };
        }

        const products = data?.products;

        if (!data || !products) {
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
      }
    } catch (e) {
      loggingService.error(
        "Unexpected error while fetching the products from Saleor",
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
