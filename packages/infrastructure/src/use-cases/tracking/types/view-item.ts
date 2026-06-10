import type { Price } from "@nimara/domain/objects/common";
import type { Product } from "@nimara/domain/objects/Product";

import type { TrackingProvider } from "./provider";

export type TrackViewItemInput = {
  price: Price;
  product: Product;
};

export type TrackViewItemProvider = TrackingProvider<TrackViewItemInput>;
