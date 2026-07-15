---
type: "Capability"
title: "Commerce Storefront"
description: "Localized shopper experience spanning homepage, navigation, catalog, cart, checkout, account, and confirmation surfaces."
tags:
  - "capability"
  - "storefront"
  - "shopper"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/app/[locale]"
  - "packages/features/src"
---

# Content

## Current implementation

The shopper surface composes homepage content, navigation, search, collection and product
pages, cart, multi-step checkout, payment confirmation, authentication, and account management.
Server routes select standard or marketplace feature variants and pass typed services into
components from `packages/features`.

The storefront is localized for US and UK routes, generates sitemap/robots and dynamic product
or collection social images, and supports both single-brand and vendor-aware presentation.

## Direction and gaps

Runtime availability depends on configured providers. The dynamic order-confirmation route is
currently a static success view. The visible newsletter action reports success without making a
subscription, the custom PDP uses placeholder reviews, and sitemap generation is incomplete and
hard-coded to a US search context. Core storefront, PDP, bag, and checkout scopes are `Gotowe`,
but OPS stabilization and UI/UX direction remain active; completed epics coexist with open defects.

## Evidence

Primary paths: `apps/storefront/src/app/[locale]`, `apps/storefront/src/foundation/routing`,
and `packages/features/src` at the recorded commit.

# Related Notes

[Storefront](../applications/Storefront.md)
[Catalog And Discovery](./Catalog%20And%20Discovery.md)
[Product Reviews](./Product%20Reviews.md)
[Cart And Checkout](./Cart%20And%20Checkout.md)
