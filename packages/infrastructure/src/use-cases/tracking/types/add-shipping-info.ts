import type { Checkout } from "@nimara/domain/objects/Checkout";

import type { TrackingProvider } from "./provider";

export type TrackAddShippingInfoInput = { checkout: Checkout };

export type TrackAddShippingInfoProvider =
  TrackingProvider<TrackAddShippingInfoInput>;
