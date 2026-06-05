import type { TrackingProvider } from "./provider";

/**
 * Consent categories the storefront manages. `necessary` is always granted;
 * `analytics` is the only opt-in. Single source of truth — the cookie store,
 * banner and tracking all derive from this, so adding a category keeps them in
 * sync. Extend when new opt-in categories are added.
 */
export type ConsentCategory = "necessary" | "analytics";

export type ConsentCategories = Record<ConsentCategory, boolean>;

/**
 * Vendor-neutral consent payload pushed to tracking providers on
 * banner/settings choice.
 */
export type UpdateConsentInput = ConsentCategories;

export type UpdateConsentProvider = TrackingProvider<UpdateConsentInput>;
