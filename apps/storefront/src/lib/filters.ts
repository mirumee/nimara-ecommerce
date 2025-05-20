import { type Facet } from "@nimara/infrastructure/use-cases/search/types";

export const getActiveFiltersCount = (
  searchParams: Record<string, string>,
  facets: Facet[],
): number => {
  const facetKeys = new Set(facets.map((facet) => facet.slug));

  return Object.entries(searchParams).filter(([key, value]) => {
    return facetKeys.has(key) && value?.trim() !== "";
  }).length;
};
