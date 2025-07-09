import type { AvailableFacets } from "@nimara/infrastructure/search/algolia/types";
import type { SearchService } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

const getSearchService = async (): Promise<SearchService> => {
  if (clientEnvs.NEXT_PUBLIC_SEARCH_SERVICE === "SALEOR") {
    const { saleorSearchService } = await import(
      "@nimara/infrastructure/search/saleor/provider"
    );

    return saleorSearchService({
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      settings: {
        sorting: [
          {
            saleorValue: {
              field: "NAME",
              direction: "ASC",
            },
            queryParamValue: "name-asc",
            messageKey: "search.name-asc",
          },
          {
            saleorValue: {
              field: "PRICE",
              direction: "DESC",
            },
            queryParamValue: "price-desc",
            messageKey: "search.price-desc",
          },
          {
            saleorValue: {
              field: "PRICE",
              direction: "ASC",
            },
            queryParamValue: "price-asc",
            messageKey: "search.price-asc",
          },
        ],
      },
      logger: storefrontLogger,
    });
  } else if (clientEnvs.NEXT_PUBLIC_SEARCH_SERVICE === "ALGOLIA") {
    const { algoliaSearchService } = await import(
      "@nimara/infrastructure/search/algolia/provider"
    );

    const commonFacets = {
      "attributes.Gender": {
        messageKey: "filters.gender",
        slug: "gender",
        type: "PLAIN_TEXT",
      },
      "attributes.Size": {
        messageKey: "filters.size",
        slug: "size",
        type: "PLAIN_TEXT",
      },
      "attributes.Color": {
        messageKey: "filters.color",
        slug: "color",
        type: "SWATCH",
      },
      collections: {
        messageKey: "filters.collections",
        slug: "collection",
        type: "PLAIN_TEXT",
      },
    } satisfies AvailableFacets;

    return algoliaSearchService({
      credentials: {
        apiKey: clientEnvs.NEXT_PUBLIC_ALGOLIA_API_KEY,
        appId: clientEnvs.NEXT_PUBLIC_ALGOLIA_APP_ID,
      },
      logger: storefrontLogger,
      settings: {
        indices: [
          {
            availableFacets: commonFacets,
            channel: "channel-uk",
            indexName: `channel-uk.GBP.products`,
            virtualReplicas: [
              {
                indexName: `channel-uk.GBP.products.name_asc`,
                messageKey: "search.name-asc",
                queryParamValue: "alpha-asc",
              },
              {
                indexName: `channel-uk.GBP.products.grossPrice_asc`,
                messageKey: "search.price-asc",
                queryParamValue: "price-asc",
              },
              {
                indexName: `channel-uk.GBP.products.grossPrice_desc`,
                messageKey: "search.price-desc",
                queryParamValue: "price-desc",
              },
            ],
          },
          {
            availableFacets: commonFacets,
            channel: "channel-us",
            indexName: `channel-us.USD.products`,
            virtualReplicas: [
              {
                indexName: `channel-us.USD.products.name_asc`,
                messageKey: "search.name-asc",
                queryParamValue: "alpha-asc",
              },
              {
                indexName: `channel-us.USD.products.grossPrice_asc`,
                messageKey: "search.price-asc",
                queryParamValue: "price-asc",
              },
              {
                indexName: `channel-us.USD.products.grossPrice_desc`,
                messageKey: "search.price-desc",
                queryParamValue: "price-desc",
              },
            ],
          },
        ],
      },
    });
  } else {
    throw new Error(
      `Unsupported search service. Supported services are SALEOR and ALGOLIA.`,
    );
  }
};

export const searchService: SearchService = await getSearchService();
