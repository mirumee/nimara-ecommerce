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
    { query, after, before, sortBy, filters, limit, productIds },
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
          slug: slug,
          boolean: value === "true" ? true : undefined,
          values: value !== "true" ? [value] : undefined,
        }))
      : undefined;

    try {
      loggingService.debug("Fetching the products from Saleor", {
        query,
        channel: context.channel,
      });

      const { data, error } = await graphqlClient(apiURL).execute(
        SearchProductQueryDocument,
        {
          variables: {
            where: productIds ? { ids: productIds } : undefined,
            search: query,
            channel: context.channel,
            // a `languageCode` is only used for fetching translated names, not for searching - Saleor does not support searching in multiple languages
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

      if (!data || !data.products) {
        return {
          results: [],
          error: null,
        };
      }

      const serializer = serializers?.search ?? searchProductSerializer;

      return {
        results: data.products.edges.map(({ node }) => serializer(node)),
        error: null,
        pageInfo: {
          type: "cursor",
          after: data.products.pageInfo.endCursor,
          before: data.products.pageInfo.startCursor,
          hasNextPage: data.products.pageInfo.hasNextPage,
          hasPreviousPage: data.products.pageInfo.hasPreviousPage,
        },
      };
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
