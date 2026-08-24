import { type Region } from "@nimara/foundation/regions/types";
import type { FetchOptions } from "@nimara/infrastructure/graphql/client";
import type { ServiceRegistry } from "@nimara/infrastructure/types";
import type {
  Facet,
  SearchContext,
  TaxonomyScope,
} from "@nimara/infrastructure/use-cases/search/types";

/**
 * Facets follow the catalog, not the request, so the server render and the
 * in-panel refresh share one cache entry per filter selection.
 */
export const FACETS_FETCH_OPTIONS: FetchOptions = {
  next: {
    // FIXME: Temp value for now
    revalidate: 5 * 60,
    tags: ["SEARCH", "SEARCH:FACETS"],
  },
};

export const buildSearchContext = (region: Region): SearchContext => ({
  currency: region.market.currency,
  channel: region.market.channel,
  languageCode: region.language.code,
});

/**
 * Resolves the facets available for a given filter set. Shared by the initial
 * server render and the action that refreshes the filter panel in place.
 */
export const fetchFacets = async ({
  services,
  region,
  query,
  filters,
  categoryScope,
}: {
  categoryScope?: TaxonomyScope;
  filters: Record<string, string>;
  query: string;
  region: Region;
  services: ServiceRegistry;
}): Promise<Facet[]> => {
  const searchService = await services.getSearchService();

  const result = await searchService.getFacets(
    {
      query,
      filters,
      categoryScope,
      options: FACETS_FETCH_OPTIONS,
    },
    buildSearchContext(region),
  );

  return result.ok ? result.data : [];
};
