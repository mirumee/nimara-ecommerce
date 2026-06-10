import type { Checkout } from "@nimara/domain/objects/Checkout";

import type { TrackingProvider } from "./provider";

export type TrackBeginCheckoutInput = { checkout: Checkout };

export type TrackBeginCheckoutProvider =
  TrackingProvider<TrackBeginCheckoutInput>;
