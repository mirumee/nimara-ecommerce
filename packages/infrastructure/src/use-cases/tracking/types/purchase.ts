import type { Checkout } from "@nimara/domain/objects/Checkout";

import type { TrackingProvider } from "./provider";

export type TrackPurchaseInput = {
  checkout: Checkout;
  orderId: string;
};

export type TrackPurchaseProvider = TrackingProvider<TrackPurchaseInput>;
