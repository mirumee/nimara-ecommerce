---
type: "Capability"
title: "Marketplace Operations"
description: "Vendor onboarding, scoped catalog and order operations, configuration, customers, and Saleor App administration."
tags:
  - "capability"
  - "marketplace"
  - "vendor"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "conditional"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/marketplace/src/app"
  - "apps/marketplace/src/lib/graphql"
  - "apps/marketplace/src/services"
  - "packages/infrastructure/src/marketplace"
---

# Content

## Current implementation

Vendors can sign up, confirm accounts, connect Stripe, and manage products, variants, stock,
channel listings, collections, orders/drafts, customers, branding, channels, warehouses, and
profile data. The application uses Saleor Page metadata as vendor identity and enforces vendor
scope through a filtered GraphQL gateway and app-local services.

Saleor App administration manages vendor status and exposes payout overview. Public storefront
vendor pages require marketplace mode and an active vendor status.

## Direction and gaps

Marketplace operations remain active while authentication, products, orders, and core
configuration are established. Registration defects remain open. Vendor reports and further
channels/warehouses configuration are not current product directions, although related surfaces
exist in code. Placeholder UI and security gaps remain readiness constraints.

## Evidence

Primary paths: marketplace App Router, GraphQL server, services, Saleor constants, and sign-up actions.

# Related Notes

[Marketplace](../applications/Marketplace.md)
[Ledger And Payouts](./Ledger%20And%20Payouts.md)
[Marketplace Vendor](../../product/personas/Marketplace%20Vendor.md)
