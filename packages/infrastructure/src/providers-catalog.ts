/**
 * Catalog of available integration providers, per swappable capability.
 *
 * This is the single source of truth for "which providers exist". The storefront
 * derives its env validation (the allowed values of NEXT_PUBLIC_SEARCH_SERVICE /
 * NEXT_PUBLIC_CMS_SERVICE) from these lists, and the provider registries are typed
 * against the id unions so adding an id here forces a matching factory.
 *
 * Keep this module dependency-free (string literals + types only) — it is imported
 * into the browser bundle via the storefront's client env schema, so it must not
 * pull in provider SDKs (algoliasearch, buttercms) or GraphQL at import time.
 */

export const SEARCH_PROVIDER_IDS = ["saleor", "algolia", "dummy"] as const;

export const CMS_PROVIDER_IDS = ["saleor", "butter-cms", "dummy"] as const;

export type SearchProviderId = (typeof SEARCH_PROVIDER_IDS)[number];

export type CMSProviderId = (typeof CMS_PROVIDER_IDS)[number];
