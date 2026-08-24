import { algoliasearch } from "algoliasearch";

import { ok } from "@nimara/domain/objects/Result";
import type {
  Facet,
  GetFacetsInfra,
} from "@nimara/infrastructure/use-cases/search/types";

import { buildFilters, getIndexName } from "../helpers";
import type { AlgoliaSearchServiceConfig } from "../types";

export const algoliaGetFacetsInfra =
  ({
    credentials,
    settings,
    logger,
  }: AlgoliaSearchServiceConfig): GetFacetsInfra =>
  async ({ query, filters, categoryScope }, { channel }) => {
    const algoliaClient = algoliasearch(credentials.appId, credentials.apiKey);
    const indexName = getIndexName(settings.indices, channel, logger);

    const parsedFilters = buildFilters({
      indices: settings.indices,
      channel,
      filters,
      categoryScope,
      logger,
    });

    const response = await algoliaClient.searchSingleIndex({
      indexName,
      searchParams: {
        query: query ?? "",
        facets: ["*"],
        responseFields: ["facets"],
        sortFacetValuesBy: "alpha",
        ...(parsedFilters && { filters: parsedFilters }),
      },
    });

    const index = settings.indices.find((index) => index.channel === channel);

    if (!index) {
      logger.info("Index not found for channel", {
        channel,
      });

      return ok([]);
    }

    const responseFacets = response?.facets ?? {};

    if (!Object.keys(responseFacets).length) {
      logger.info("No facets found in Algolia results", {
        indexName,
        channel,
        filters: parsedFilters,
      });

      return ok([]);
    }

    const facets = Object.entries(responseFacets).reduce<Facet[]>(
      (acc, [facetName, choices]) => {
        const indexFacetConfig = index.availableFacets[facetName];

        if (!indexFacetConfig) {
          return acc;
        }

        acc.push({
          ...indexFacetConfig,
          choices: Object.entries(choices).map(([name, _count]) => ({
            label: name,
            value: name,
          })),
        });

        return acc;
      },
      [],
    );

    return ok(facets);
  };
