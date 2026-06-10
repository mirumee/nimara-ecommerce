import type { Cart } from "@nimara/domain/objects/Cart";

import type { TrackingProvider } from "./provider";

export type TrackViewCartInput = { cart: Cart };

export type TrackViewCartProvider = TrackingProvider<TrackViewCartInput>;
