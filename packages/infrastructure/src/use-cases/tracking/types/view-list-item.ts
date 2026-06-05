import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import type { TrackingProvider } from "./provider";

export type TrackViewListItemInput = {
  items: SearchProduct[];
  listId: string;
  listName: string;
};

export type TrackViewListItemProvider =
  TrackingProvider<TrackViewListItemInput>;
