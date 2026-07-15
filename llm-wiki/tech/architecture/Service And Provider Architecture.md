---
type: "Architecture Note"
title: "Service And Provider Architecture"
description: "Storefront service registry, lazy capability loaders, provider catalogs, environment selection, and zero-config fallbacks."
tags:
  - "architecture"
  - "services"
  - "providers"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/services"
  - "apps/storefront/src/envs"
  - "packages/infrastructure/src/lib/create-service-selector.ts"
  - "packages/infrastructure/src/types.ts"
  - "packages/infrastructure/src/providers"
---

# Content

## Composition root

`apps/storefront/src/services/registry.ts` creates a cached registry whose lazy, memoized
getters implement 12 capabilities: address, CMS menu/page, cart, checkout, collection,
marketplace, payment, search, store/product, tracking, and user. Contracts live in
`packages/infrastructure/src/types.ts`; capability implementations are loaded only when used.

Auth, fulfillment, ACP, UCP, and error reporting remain outside this registry.

## Provider selection

- Search: Saleor, Algolia, or dummy.
- CMS page/menu: one shared selection of Saleor, ButterCMS, or dummy.
- Payment: Stripe only on the reviewed snapshot.

`SEARCH_SERVICE` and `CMS_SERVICE` select providers server-side at build time. Provider factories
validate their own configuration. If Saleor is selected without an API URL, non-production
uses dummy CMS/search while production uses empty services; other capabilities use empty services.

## Boundaries and gaps

The registry makes storefront integrations replaceable at stable contracts, but provider
agnosticism is uneven. Payment is not selected by an equivalent provider catalog, the preflight
doctor covers only search and CMS, and an older `apps/storefront/src/services/search.ts`
composition root remains unused.

Lazy provider loading is implemented, while broader provider swapping and Medusa support remain
planned or in refinement. Code already implements part of that direction for CMS/search, but no
universal backend or payment-provider boundary exists.

## Evidence

Storefront service registry/loaders/resolution code, environment schemas, and infrastructure
provider selectors at the recorded commit.

# Related Notes

[Monorepo Layers](./Monorepo%20Layers.md)
[Content Search And Localization](../../system/capabilities/Content%20Search%20And%20Localization.md)
[CMS And Search](../integrations/CMS%20And%20Search.md)
