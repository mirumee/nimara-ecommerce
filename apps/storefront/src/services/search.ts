import { type Logger } from "@nimara/infrastructure/logging/types";
import {
  type AlgoliaSearchServiceConfig,
  type AvailableFacets,
} from "@nimara/infrastructure/search/algolia/types";
import { type SaleorSearchServiceConfig } from "@nimara/infrastructure/search/saleor/types";
import { type SearchService } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

export const SALEOR_SEARCH_SERVICE_CONFIG = (logger: Logger) =>
  ({
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
    logger: logger,
  }) as const satisfies SaleorSearchServiceConfig;

const commonFacets = {
  "attributes.Category": {
    messageKey: "filters.category",
    slug: "category",
    type: "DROPDOWN",
  },
  "attributes.Color": {
    messageKey: "filters.color",
    slug: "color",
    type: "SWATCH",
  },
  "attributes.Format album": {
    messageKey: "filters.format-album",
    slug: "format-album",
    type: "DROPDOWN",
  },
  "attributes.Genres": {
    messageKey: "filters.genre",
    slug: "genre",
    type: "DROPDOWN",
  },
  "attributes.Is exclusive": {
    messageKey: "filters.is-exclusive",
    slug: "is-exclusive",
    type: "BOOLEAN",
  },
  "attributes.Limited edition": {
    messageKey: "filters.limited-edition",
    slug: "limited-edition",
    type: "BOOLEAN",
  },
  "attributes.Record label": {
    messageKey: "filters.record-label",
    slug: "record-label",
    type: "DROPDOWN",
  },
  "attributes.Size": {
    messageKey: "filters.size",
    slug: "size",
    type: "PLAIN_TEXT",
  },
  collections: {
    messageKey: "filters.collections",
    slug: "collection",
    type: "DROPDOWN",
  },
} satisfies AvailableFacets;

export const ALGOLIA_SEARCH_SERVICE_CONFIG = (logger: Logger) =>
  ({
    credentials: {
      apiKey: clientEnvs.NEXT_PUBLIC_ALGOLIA_API_KEY,
      appId: clientEnvs.NEXT_PUBLIC_ALGOLIA_APP_ID,
    },
    logger: logger,
    settings: {
      indices: [
        {
          availableFacets: commonFacets,
          channel: "channel-uk",
          indexName: "channel-uk.GBP.products",
          virtualReplicas: [
            {
              indexName: "channel-uk.GBP.products.name_asc",
              messageKey: "search.name-asc",
              queryParamValue: "alpha-asc",
            },
            {
              indexName: "channel-uk.GBP.products.grossPrice_asc",
              messageKey: "search.price-asc",
              queryParamValue: "price-asc",
            },
            {
              indexName: "channel-uk.GBP.products.grossPrice_desc",
              messageKey: "search.price-desc",
              queryParamValue: "price-desc",
            },
          ],
        },
        {
          availableFacets: commonFacets,
          channel: "channel-us",
          indexName: "channel-us.USD.products",
          virtualReplicas: [
            {
              indexName: "channel-us.USD.products.name_asc",
              messageKey: "search.name-asc",
              queryParamValue: "alpha-asc",
            },
            {
              indexName: "channel-us.USD.products.grossPrice_asc",
              messageKey: "search.price-asc",
              queryParamValue: "price-asc",
            },
            {
              indexName: "channel-us.USD.products.grossPrice_desc",
              messageKey: "search.price-desc",
              queryParamValue: "price-desc",
            },
          ],
        },
      ],
    },
  }) as const satisfies AlgoliaSearchServiceConfig;

let loadedService: SearchService | null = null;

/**
 * Loads the Saleor AddressService instance.
 * @returns A promise that resolves to the AddressService instance.
 */
export const getSearchService = async (): Promise<SearchService> => {
  if (loadedService) {
    return loadedService;
  }

  const storefrontLogger = await getStorefrontLogger();

  if (clientEnvs.NEXT_PUBLIC_SEARCH_SERVICE === "ALGOLIA") {
    const { algoliaSearchService } = await import(
      "@nimara/infrastructure/search/algolia/provider"
    );

    loadedService = algoliaSearchService(
      ALGOLIA_SEARCH_SERVICE_CONFIG(storefrontLogger),
    );
  } else {
    const { saleorSearchService } = await import(
      "@nimara/infrastructure/search/saleor/provider"
    );

    loadedService = saleorSearchService(
      SALEOR_SEARCH_SERVICE_CONFIG(storefrontLogger),
    );
  }

  return loadedService;
};
