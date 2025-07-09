import { algoliasearch } from "algoliasearch";

import { ok } from "@nimara/domain/objects/Result";
import type {
  Facet,
  GetFacetsInfra,
} from "@nimara/infrastructure/use-cases/search/types";

import { getIndexName } from "../helpers";
import type { AlgoliaSearchServiceConfig } from "../types";

export const algoliaGetFacetsInfra = ({
  credentials,
  settings,
  logger,
}: AlgoliaSearchServiceConfig): GetFacetsInfra => {
  const algoliaClient = algoliasearch(credentials.appId, credentials.apiKey);

  return async (params, context) => {
    const indexName = getIndexName(settings.indices, context.channel);

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

    const response = await algoliaClient.searchSingleIndex({
      indexName,
      searchParams: {
        query: params?.query ?? "",
        facets: ["*"],
        responseFields: ["facets"],
        sortFacetValuesBy: "alpha",
        ...(!!Object.keys(parsedFilters).length && {
          filters: parsedFilters,
        }),
      },
    });

    const index = settings.indices.find(
      (index) => index.channel === context.channel,
    );

    if (!index) {
      logger.info("Index not found for channel", {
        channel: context.channel,
      });

      return ok([]);
    }

    if (!response?.facets) {
      logger.info("No facets found in Algolia results", {
        indexName,
        channel: context.channel,
      });

      return ok([]);
    }

    const facets = Object.entries(response.facets).reduce<Facet[]>(
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
};
