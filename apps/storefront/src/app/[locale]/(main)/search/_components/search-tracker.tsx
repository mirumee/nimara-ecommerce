"use client";

import { useEffect } from "react";

import { createTrackingServiceLoader } from "@/services/lazy-loaders/tracking";

const trackingServiceLoader = createTrackingServiceLoader();

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
