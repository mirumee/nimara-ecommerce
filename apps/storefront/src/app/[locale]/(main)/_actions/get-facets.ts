"use server";

import { fetchFacets } from "@nimara/features/search/shared/helpers/fetch-facets";
import type { GetFacetsAction } from "@nimara/features/search/shared/types";

import { getCurrentRegion } from "@/foundation/regions";
import { getServiceRegistry } from "@/services/registry";

/**
 * Server action wrapper that lets the filter panel re-read its facets for a
 * filter set the user has selected but not yet submitted.
 */
export const getFacets: GetFacetsAction = async ({
  query,
  filters,
  categoryScope,
}) => {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  return fetchFacets({ services, region, query, filters, categoryScope });
};
