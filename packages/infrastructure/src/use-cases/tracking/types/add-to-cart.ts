import type { Price } from "@nimara/domain/objects/common";
import type { Product } from "@nimara/domain/objects/Product";

import type { TrackingProvider } from "./provider";

export type TrackAddToCartInput = {
  price: Price;
  product: Pick<Product, "id" | "name">;
  quantity: number;
};

export type TrackAddToCartProvider = TrackingProvider<TrackAddToCartInput>;
