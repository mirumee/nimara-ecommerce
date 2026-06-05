import type { TrackSearchProvider } from "#root/use-cases/tracking/types/search";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#search
 */
export const gtmTrackSearchInfra = (): TrackSearchProvider => ({
  async track({ searchTerm, resultsCount }) {
    pushDataLayer({
      event: "search",
      search_term: searchTerm,
      ...(resultsCount !== undefined && { number_of_results: resultsCount }),
    });
  },
});
