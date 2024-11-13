import algoliasearch from "algoliasearch";
import { join } from "path";

import { loggingService } from "@nimara/infrastructure/logging/service";
import type { SearchInfra } from "@nimara/infrastructure/use-cases/search/types";

import { getIndexName } from "../helpers";
import { searchProductSerializer } from "../serializers";
import type { AlgoliaSearchServiceConfig } from "../types";

export const algoliaSearchInfra = ({
  credentials,
  serializers,
  settings,
}: AlgoliaSearchServiceConfig): SearchInfra => {
  const algoliaClient = algoliasearch(credentials.appId, credentials.apiKey);

  return async ({ page, filters, sortBy, query, limit }, { channel }) => {
    const indexName = getIndexName(settings.indices, channel, sortBy);
    const searchIndex = algoliaClient.initIndex(indexName);

    const mainIndex = settings.indices.find(
      (index) => index.channel === channel,
    );

    // Create a mapping between slugs and Algolia name
    const facetsMapping = Object.entries(
      mainIndex?.availableFacets ?? {},
    ).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[value.slug] = key;

      return acc;
    }, {});

    // Create a mapping between slugs and Algolia name
    const parsedFilters = Object.entries(filters ?? {})
      .reduce<string[]>((acc, [name, value], index) => {
        if (name in facetsMapping) {
          const values = value.split(".");

          if (values.length > 1) {
            const multipleValuesFacet: string[] = [];

            values.forEach((v) => {
              multipleValuesFacet.push(`${facetsMapping[name]}:${v}`);
            });

            acc.push(multipleValuesFacet.join(" OR "));
          } else {
            acc.push(`${facetsMapping[name]}:${value}`);
          }
        }

        return acc;
      }, [])
      .join(" AND ");

    try {
      const {
        hits,
        page: currentPage,
        nbPages,
      } = await searchIndex.search(query as string, {
        page: page ? Number.parseInt(page) - 1 : 0,
        hitsPerPage: limit,
        filters: parsedFilters,
        responseFields: ["hits", "page", "nbPages"],
      });

      const serializer = serializers?.search ?? searchProductSerializer;

      return {
        pageInfo: {
          type: "numeric",
          currentPage: currentPage + 1,
          hasNextPage: currentPage < nbPages - 1,
          hasPreviousPage: currentPage > 0,
        },
        results: hits.map(serializer),
        error: null,
      };
    } catch (e) {
      loggingService.error("Failed to fetch the products from Algolia", {
        error: e,
      });

      return {
        results: [],
        error: e,
      };
    }
  };
};
