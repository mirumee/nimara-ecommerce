---
type: "Capability"
title: "Catalog And Discovery"
description: "Product, collection, vendor, search, filtering, pricing, availability, and product-detail discovery in the storefront."
tags:
  - "capability"
  - "catalog"
  - "search"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "conditional"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/app/[locale]/(main)"
  - "packages/infrastructure/src/search"
  - "packages/infrastructure/src/store"
  - "packages/infrastructure/src/collection"
---

# Content

## Current implementation

Catalog discovery includes search/PLP, filtering, collection pages, PDP, vendor pages, product
pricing and availability, and standard links into cart. Search is selected at build time from
Saleor, Algolia, or dummy providers. Product/store and collection data use Saleor-backed
services; marketplace PDP and vendor views are feature-gated.

## Direction and gaps

The natural-language discovery PRD is planned product knowledge, not current implementation.
Classic search, PLP, and PDP behavior is established, while TypeScript custom search remains
active, a Python successor is planned, and search/PDP defects remain open. The reviewed code
exposes Saleor/Algolia search plus UCP catalog APIs, but no standalone custom-search application.
A review list is visible only in the custom PDP and is hard-coded; see
[Product Reviews](./Product%20Reviews.md).

## Evidence

Primary paths: storefront search/product/collection/vendor routes and
`packages/infrastructure/src/{search,store,collection}`.

# Related Notes

[Content Search And Localization](./Content%20Search%20And%20Localization.md)
[Agentic Commerce](./Agentic%20Commerce.md)
[Product Reviews](./Product%20Reviews.md)
[Natural-Language Product Discovery](../../product/prds/PRD-001%20Natural-Language%20Product%20Discovery.md)
