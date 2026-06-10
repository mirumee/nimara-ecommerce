import type { Line } from "@nimara/domain/objects/common";

import type { TrackingProvider } from "./provider";

export type TrackRemoveFromCartInput = { line: Line };

export type TrackRemoveFromCartProvider =
  TrackingProvider<TrackRemoveFromCartInput>;
