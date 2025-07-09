import { algoliasearch } from "algoliasearch";

import { err, ok } from "@nimara/domain/objects/Result";
import type {
  Facet,
  SearchInfra,
} from "@nimara/infrastructure/use-cases/search/types";

import { buildFilters, getIndexName } from "../helpers";
import { searchProductSerializer } from "../serializers";
import type { AlgoliaSearchServiceConfig, ProductHit } from "../types";

export const algoliaSearchInfra =
  ({
    credentials,
    serializers,
    settings,
    logger,
  }: AlgoliaSearchServiceConfig): SearchInfra =>
  async ({ page, filters, sortBy, query, limit }, { channel }) => {
    const client = algoliasearch(credentials.appId, credentials.apiKey);
    const indexName = getIndexName(settings.indices, channel, logger, sortBy);

    const parsedFilters = buildFilters({
      indices: settings.indices,
      channel,
      filters,
    });

    try {
      const response = await client.searchSingleIndex<ProductHit>({
        indexName,
        searchParams: {
          query: query ?? "",
          facets: ["*"],
          page: page ? Number.parseInt(page) - 1 : 0,
          hitsPerPage: limit,
          filters: parsedFilters,
          responseFields: ["hits", "page", "nbPages", "facets"],
        },
      });

      let facets: Facet[] = [];

      if (response.facets) {
        const index = settings.indices.find(
          (index) => index.channel === channel,
        );

        if (index) {
          facets = Object.entries(response.facets).reduce<Facet[]>(
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
        }
      }

      const currentPage = response.page ? response.page : 0;
      const hasNextPage = currentPage < (response.nbPages ?? 0) - 1;
      const serializer = serializers?.search ?? searchProductSerializer;

      return ok({
        pageInfo: {
          type: "numeric",
          currentPage: currentPage + 1,
          hasNextPage: hasNextPage,
          hasPreviousPage: currentPage > 0,
        },
        results: response.hits.map(serializer),
        facets,
        error: null,
      });
    } catch (e) {
      logger.error("Unexpected error while fetching products from Saleor", {
        error: e,
      });

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected error while fetching products from Saleor",
        },
      ]);
    }
  };
