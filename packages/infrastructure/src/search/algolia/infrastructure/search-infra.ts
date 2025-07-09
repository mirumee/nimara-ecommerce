import { algoliasearch } from "algoliasearch";

import { err, ok } from "@nimara/domain/objects/Result";
import type {
  Facet,
  SearchInfra,
} from "@nimara/infrastructure/use-cases/search/types";

import { getIndexName } from "../helpers";
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
    const indexName = getIndexName(settings.indices, channel, sortBy);

    const mainIndex = settings.indices.find(
      (index) => index.channel === channel,
    );

    const facetsMapping = Object.entries(
      mainIndex?.availableFacets ?? {},
    ).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[value.slug] = key;

      return acc;
    }, {});

    const parsedFilters = Object.entries(filters ?? {})
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
        } else if (name in facetsMapping) {
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
          facets = Object.entries(response.facets ?? {}).reduce<Facet[]>(
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
