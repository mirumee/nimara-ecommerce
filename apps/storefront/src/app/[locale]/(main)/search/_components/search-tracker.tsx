"use client";

import { useEffect } from "react";

import { createTrackingServiceLoader } from "@/services/lazy-loaders/tracking";

const trackingServiceLoader = createTrackingServiceLoader();

/**
 * Fires a GA4 `search` event once per search term. The results count lives
 * inside the search view package, so only the term is reported.
 */
export const SearchTracker = ({ searchTerm }: { searchTerm: string }) => {
  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    void (async () => {
      const { trackSearch } = await trackingServiceLoader();

      await trackSearch({ searchTerm });
    })();
  }, [searchTerm]);

  return null;
};
