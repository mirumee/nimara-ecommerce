---
type: "Application"
title: "Storefront"
description: "Customer-facing Next.js application for shopping, accounts, checkout, composable integrations, and ACP/UCP commerce APIs."
tags:
  - "application"
  - "storefront"
  - "nextjs"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "conditional"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront"
  - "packages/features"
  - "packages/infrastructure"
  - "packages/i18n"
---

# Content

## Current implementation

The storefront exposes homepage, search, product, collection, CMS page, vendor, cart, checkout,
order/payment confirmation, authentication, and customer-account routes. Account functions
include profile, addresses, orders and returns, saved payment methods, privacy settings, and
account deletion.

Its composition root is `apps/storefront/src/services/registry.ts`, which lazily provides
address, CMS menu/page, cart, checkout, collection, marketplace, payment, search, store,
tracking, and user services. Search supports Saleor, Algolia, and dummy providers; CMS pages
and menus support Saleor, ButterCMS, and dummy providers.

The application also exposes signed Saleor cache webhooks, a development preflight endpoint,
legacy ACP endpoints, and UCP discovery/catalog/cart/checkout/order APIs.

## Conditional behavior and gaps

- Saleor-backed commerce requires `NEXT_PUBLIC_SALEOR_API_URL`.
- Standard Stripe requires the Saleor URL, public key, and payment app ID.
- Marketplace UI and multi-checkout behavior require the marketplace feature flag and vendor URL.
- GTM and analytics are optional and consent-gated.
- UCP order adjustment accepts a route but returns `422`; it is not implemented.
- UCP AP2 mandate checks are dummy functions that return success; version negotiation requires
  an exact `2026-04-08` match, and a degraded completion fallback hard-codes USD with zero totals.
- The order-confirmation page is a static success surface and does not load the route order ID.
- The newsletter form action returns `{ ok: true }` without subscribing the visitor.
- The custom PDP review list uses hard-coded example data, not persistent customer reviews.
- The sitemap is not exhaustive: it uses a fixed US search context and includes only home plus
  at most 100 product URLs.

## Direction and gaps

Storefront direction is active across operational stabilization, TypeScript custom search,
UI/UX, test coverage, SEO, tracking, and newsletter work. Code already contains consent/tracking
foundations, while newsletter subscription is still a placeholder and custom search is not
integrated into this repository snapshot. Established storefront scope coexists with open
checkout, search, sitemap, and account defects; maturity does not mean gap-free behavior.

## Evidence

Primary paths: `apps/storefront/src/app/[locale]`, `apps/storefront/src/app/api`,
`apps/storefront/src/services/registry.ts`, `apps/storefront/src/envs`,
`apps/storefront/src/features/ucp`, and `packages/infrastructure/src`.

# Related Notes

[Commerce Storefront](../capabilities/Commerce%20Storefront.md)
[Agentic Commerce](../capabilities/Agentic%20Commerce.md)
[Service And Provider Architecture](../../tech/architecture/Service%20And%20Provider%20Architecture.md)
