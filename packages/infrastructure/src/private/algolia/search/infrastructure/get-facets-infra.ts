import algoliasearch from "algoliasearch";

import { loggingService } from "@nimara/infrastructure/logging/service";
import type {
  Facet,
  GetFacetsInfra,
} from "@nimara/infrastructure/use-cases/search/types";

import { getIndexName } from "../helpers";
import type { AlgoliaSearchServiceConfig } from "../types";

export const algoliaGetFacetsInfra = ({
  credentials,
  settings,
}: AlgoliaSearchServiceConfig): GetFacetsInfra => {
  const algoliaClient = algoliasearch(credentials.appId, credentials.apiKey);

  return async (params, context) => {
    const indexName = getIndexName(settings.indices, context.channel);
    const searchIndex = algoliaClient.initIndex(indexName);

    const response = await searchIndex.search(params?.query ?? "", {
      facets: ["*"],
      sortFacetValuesBy: "alpha",
      responseFields: ["facets"],
    });

    if (!response.facets) {
      return {
        facets: [],
      };
    }

    const index = settings.indices.find(
      (index) => index.channel === context.channel,
    );

    if (!index) {
      loggingService.info("Index not found for channel", {
        channel: context.channel,
      });

      return {
        facets: [],
      };
    }

    const facets = Object.entries(response.facets).reduce<Facet[]>(
      (acc, [facetName, facetChoices]) => {
        const indexFacetConfig = index.availableFacets[facetName];

        if (!indexFacetConfig) {
          loggingService.error("Missing facet configuration within index", {
            facetName,
            indexName: index.indexName,
          });

          return acc;
        }

        acc.push({
          ...indexFacetConfig,
          choices: Object.entries(facetChoices).map(([name, _count]) => ({
            label: name,
            value: name,
          })),
        });

        return acc;
      },
      [],
    );

    return { facets };
  };
};
