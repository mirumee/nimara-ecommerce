"use server";

import { fetchFacets } from "@nimara/features/search/shared/helpers/fetch-facets";
import type { Facet } from "@nimara/infrastructure/use-cases/search/types";

import { getCurrentRegion } from "@/foundation/regions";
import { getServiceRegistry } from "@/services/registry";

/**
 * Server action wrapper that lets the filter panel re-read its facets for a
 * filter set the user has selected but not yet submitted.
 */
export async function getFacets(
  categorySlug: string | undefined,
  { query, filters }: { filters: Record<string, string>; query: string },
): Promise<Facet[]> {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  return fetchFacets({ services, region, query, filters, categorySlug });
}
