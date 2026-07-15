---
type: "Architecture Note"
title: "Runtime And Data Flows"
description: "Key rendering, vendor identity, GraphQL scoping, multi-vendor payment, ledger, and settlement flows."
tags:
  - "architecture"
  - "runtime"
  - "data-flow"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/app"
  - "apps/storefront/src/services"
  - "apps/marketplace/src/lib/graphql"
  - "apps/marketplace/src/lib/ledger"
  - "apps/marketplace/src/lib/stripe"
---

# Content

## Storefront rendering

App Router pages fetch the service registry, locale/region, and access token, then compose page
variants from `packages/features`. Product and cart/checkout surfaces select standard or
marketplace variants from environment configuration.

## Vendor identity and scoping

The canonical vendor ID in active flows is the Saleor Vendor Profile `Page.id`. It is stored in
`vendor.id` metadata on users, products, collections, and orders. Marketplace GraphQL filters
and validates operations against that metadata. Public vendor pages require active vendor status.

## Multi-vendor checkout and settlement

1. Storefront stores a vendor-to-checkout map in a cookie and aggregates sub-checkouts.
2. Marketplace creates one Stripe PaymentIntent carrying sub-checkout metadata and Saleor transactions.
3. A successful Stripe event reports charged transactions and completes Saleor checkouts.
4. `ORDER_PAID` creates an idempotent ledger `order_gross` entry when Postgres is configured.
5. Stripe settlement data marks funds available.
6. Closing a batch consumes eligible entries per vendor/currency.
7. Executing the batch creates idempotent Stripe Transfers to Connect accounts.

The flow does not calculate platform/Stripe fees and does not create Stripe bank Payout objects.

## Evidence boundary

These are statically wired flows. Production deployment, external webhook delivery, and
operational authorization require runtime verification. Marketplace cart, payment, and order
splitting are established, and ACP/UCP delivery scope is treated as complete, but those maturity
claims do not close the ledger, security, or protocol gaps.

# Related Notes

[Cart And Checkout](../../system/capabilities/Cart%20And%20Checkout.md)
[Ledger And Payouts](../../system/capabilities/Ledger%20And%20Payouts.md)
[Marketplace](../../system/applications/Marketplace.md)
