---
type: "Capability"
title: "Cart And Checkout"
description: "Cart lifecycle, address and delivery collection, promo codes, payment handoff, and Saleor order completion."
tags:
  - "capability"
  - "cart"
  - "checkout"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/foundation/checkout"
  - "apps/storefront/src/features/checkout"
  - "apps/storefront/src/app/[locale]/(checkout)"
  - "packages/infrastructure/src/cart"
  - "packages/infrastructure/src/checkout"
---

# Content

## Current implementation

The cart supports create/get and line add/update/delete. Checkout collects identity, shipping
and billing addresses, delivery method, promo code, and payment selection before completing a
Saleor checkout. Server Actions coordinate the infrastructure services and use cookie-backed
state for standard or vendor-split checkout sessions.

Marketplace mode aggregates multiple vendor checkout IDs and totals before handing payment to
the marketplace application. Standard mode hands payment to the configured Stripe app.

## Direction and gaps

Implementation is wired and cart, checkout, and discount behavior is established, but runtime
success requires Saleor plus the chosen payment path. State loss, unavailable products,
user-association, possible overcharge, and international-address handling remain active problem
areas; Stripe Tax is planned. Existing E2E page objects encode an older multi-route checkout
model, so static wiring does not establish reliable end-to-end behavior.

## Evidence

Primary paths: storefront checkout routes/features/foundation and
`packages/infrastructure/src/{cart,checkout}`.

# Related Notes

[Payments](./Payments.md)
[Commerce Storefront](./Commerce%20Storefront.md)
[Checkout And Payments](../../tech/saleor/Checkout%20%26%20Payments.md)
