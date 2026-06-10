import type { TrackingProvider } from "./provider";

export type TrackSearchInput = {
  resultsCount?: number;
  searchTerm: string;
};

export type TrackSearchProvider = TrackingProvider<TrackSearchInput>;
