---
type: "Operational Record"
title: "Storefront Provider Change and Rollback"
description: "Rollback procedure for changing the storefront search or content provider and restoring a known-good build when validation or production behavior fails."
tags:
  - "operations"
  - "rollback"
  - "storefront"
  - "providers"
  - "configuration"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0006"
status: "active"
owner: "storefront-platform"
kind: "rollback"
relations:
  implementations: []
  product_records:
    - "[Swappable Storefront Search and Content Providers](../product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)"
    - "[Search Provider Selection](../product/integrations/INT-0001%20Search%20Provider%20Selection.md)"
    - "[Content Provider Selection](../product/integrations/INT-0002%20Content%20Provider%20Selection.md)"
---

# Trigger

Use this procedure before changing `SEARCH_SERVICE` or `CMS_SERVICE`, and when a provider change
causes build failure, empty or incorrect search/content, vendor-scope leakage, authentication errors,
latency, or an upstream outage that requires restoring the previous provider build.

# Preconditions

- Record the current immutable application ref, deployment ID, `SEARCH_SERVICE`, `CMS_SERVICE`, and
  the names and versions of all provider-specific configuration values. Store secrets only in the
  deployment platform, not in rollback evidence.
- Identify the last known-good deployment and retain its environment snapshot. A provider choice is
  compiled at build time, so rollback always requires restoring configuration and deploying a build.
- Confirm the requested lower-case provider ID is one of `saleor`, `algolia`, or `dummy` for search,
  and `saleor`, `butter-cms`, or `dummy` for content.
- Define checks for search results, facets, sorting, product links, navigation menus, content pages,
  locale behavior, and any marketplace vendor filtering before changing production.

# Procedure

1. Apply the proposed `SEARCH_SERVICE` and `CMS_SERVICE` values in a preview environment. Supply only
   the selected provider's namespaced server-side configuration.
2. Run `pnpm preflight --report` with the exact preview environment. Reject unknown provider values,
   missing keys, invalid index definitions, or a production configuration that would fall back to
   empty services.
3. Rebuild and deploy the preview. Verify the defined behavior checks and review provider-specific
   logs, rate limits, permissions, indices, content models, and response latency.
4. For marketplace storefronts using Algolia, explicitly verify vendor-scoped search. The current
   adapter does not enforce the fixed vendor metadata filter; do not promote a build that exposes
   another vendor's products.
5. Promote by applying the same environment values to production and creating a fresh production
   build. Keep the prior deployment and environment snapshot available.
6. If validation or production behavior fails, restore the previous `SEARCH_SERVICE`, `CMS_SERVICE`,
   and their prior provider-specific values together. Redeploy the last known-good immutable ref,
   then repeat the same behavior checks.

# Verification

- Confirm the build logs and preflight name the intended effective provider for both search and
  content; content pages and menus must use the same provider ID.
- Verify representative search terms, zero-result behavior, facets, sorting, pagination, product
  details, menus, content pages, and locale/channel combinations.
- Confirm non-production sample data appears only when intentionally using `dummy` or the permitted
  unconfigured fallback. Production must not expose sample commerce or content.
- After rollback, confirm the deployment ID, immutable ref, provider values, credentials, and
  external index/content state match the retained known-good snapshot.

# Escalation

- Selection offers no runtime failover. Do not expect an environment-variable edit without a
  rebuild, or an automatic switch when an upstream provider fails.
- The manual QA deployment workflow currently supplies `NEXT_PUBLIC_SEARCH_SERVICE` and
  `NEXT_PUBLIC_CMS_SERVICE` with upper-case choices, while the active contract reads lower-case
  server-side `SEARCH_SERVICE` and `CMS_SERVICE`. Do not use that workflow as provider-change proof
  until it is reconciled.
- Restoring the application does not roll back external index writes, content-model changes, token
  rotation, or Saleor data. Reconcile those systems separately and preserve audit evidence.
- Escalate suspected cross-vendor data exposure, use of an over-privileged search key, sample data in
  production, or a provider rollback that cannot reproduce the prior known-good result.

# Provenance

- This rollback contract is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [server environment schema](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/envs/server.ts),
  [provider preflight](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/scripts/preflight.mts),
  [search-provider manifests](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/packages/infrastructure/src/search/select.ts),
  and
  [content-provider catalog](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/packages/infrastructure/src/providers/cms.ts).
