import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import type { TrackingProvider } from "./provider";

export type TrackSelectItemInput = {
  listId: string;
  listName: string;
  product: SearchProduct;
};

export type TrackSelectItemProvider = TrackingProvider<TrackSelectItemInput>;
