import type { TrackingProvider } from "./provider";

export type ConsentCategory = "necessary" | "analytics";

export type ConsentCategories = Record<ConsentCategory, boolean>;

export type UpdateConsentInput = ConsentCategories;

export type UpdateConsentProvider = TrackingProvider<UpdateConsentInput>;
