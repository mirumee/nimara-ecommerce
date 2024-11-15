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

    // Create a mapping between slugs and Algolia name
    const parsedFilters = Object.entries(params?.filters ?? {})
      .reduce<string[]>((acc, [name, value]) => {
        if (name === "category") {
          const formattedValue = (
            String(value).charAt(0).toUpperCase() + String(value).slice(1)
          ).replaceAll("-", " & ");

          acc.push(`categories.lvl0:'${formattedValue}'`);
        }

        if (name === "collection") {
          const formattedValue = value
            .split(".")
            .map(
              (v) =>
                `'${v.charAt(0).toUpperCase() + v.slice(1).replaceAll("-", " & ")}'`,
            )
            .join(" OR ");

          acc.push(`collections:${formattedValue}`);
        }

        // if (name in facetsMapping) {
        const values = value.split(".");

        if (values.length > 1) {
          const multipleValuesFacet: string[] = [];

          values.forEach((v) => {
            multipleValuesFacet.push(`${name}:${v}`);
          });

          acc.push(multipleValuesFacet.join(" OR "));
        } else {
          acc.push(`${name}:${value}`);
        }
        // }

        return acc;
      }, [])
      .join(" AND ");

    const response = await searchIndex.search(params?.query ?? "", {
      facets: ["*"],
      ...(!!Object.keys(parsedFilters).length && { filters: parsedFilters }),
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
