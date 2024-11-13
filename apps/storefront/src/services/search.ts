import { algoliaSearchService } from "@nimara/infrastructure/private/algolia/search/providers";
import type { AvailableFacets } from "@nimara/infrastructure/private/algolia/search/types";
import { saleorSearchService } from "@nimara/infrastructure/public/saleor/search/providers";
import type { SearchService } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";

const facets = {
  "attributes.Gender": {
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
} satisfies AvailableFacets;

export const searchServiceAlgolia = algoliaSearchService({
  credentials: {
    apiKey: clientEnvs.NEXT_PUBLIC_ALGOLIA_API_KEY,
    appId: clientEnvs.NEXT_PUBLIC_ALGOLIA_APP_ID,
  },
  settings: {
    indices: [
      {
        availableFacets: facets,
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
        availableFacets: facets,
        channel: "channel-us",
        indexName: `channel-us`,
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

export const searchServiceSaleor = saleorSearchService({
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
});

// export const searchService: SearchService = searchServiceSaleor;
export const searchService: SearchService = searchServiceAlgolia;
