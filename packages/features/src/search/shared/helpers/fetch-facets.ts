import { type Region } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";
import type {
  Facet,
  SearchContext,
} from "@nimara/infrastructure/use-cases/search/types";

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
  categorySlug,
}: {
  categorySlug?: string;
  filters: Record<string, string>;
  query: string;
  region: Region;
  services: ServiceRegistry;
}): Promise<Facet[]> => {
  const searchService = await services.getSearchService();

  const result = await searchService.getFacets(
    {
      query,
      filters: {
        ...filters,
        ...(categorySlug ? { category: categorySlug } : {}),
      },
    },
    buildSearchContext(region),
  );

  return result.ok ? result.data : [];
};
