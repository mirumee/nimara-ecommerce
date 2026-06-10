import type { TrackingProvider } from "./provider";

export type TrackLoginInput = { method: string };

export type TrackLoginProvider = TrackingProvider<TrackLoginInput>;
