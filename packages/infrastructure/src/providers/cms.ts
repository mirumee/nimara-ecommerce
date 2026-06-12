/**
 * Canonical CMS provider id catalog. A single `CMS_SERVICE` env selects one
 * provider for *both* CMS capabilities (pages and menus), so the two must cover
 * the same id set. This is the ONE place to add/remove a CMS provider — the
 * `cms-page` and `cms-menu` selectors are keyed by this tuple, so omitting a
 * provider in either is a compile error.
 */
export const CMS_PROVIDER_IDS = ["saleor", "butter-cms", "dummy"] as const;

export type CMSProviderId = (typeof CMS_PROVIDER_IDS)[number];
