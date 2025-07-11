import {
  type AlgoliaSearchServiceConfig,
  type AvailableFacets,
} from "@nimara/infrastructure/search/algolia/types";
import { type SaleorSearchServiceConfig } from "@nimara/infrastructure/search/saleor/types";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export const SALEOR_SEARCH_SERVICE_CONFIG = {
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
} as const satisfies SaleorSearchServiceConfig;

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

export const ALGOLIA_SEARCH_SERVICE_CONFIG = {
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
} as const satisfies AlgoliaSearchServiceConfig;
