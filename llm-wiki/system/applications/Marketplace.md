---
type: "Application"
title: "Marketplace"
description: "Vendor and operator application combining marketplace workflows, Saleor App integration, Stripe Connect, and optional ledger settlement."
tags:
  - "application"
  - "marketplace"
  - "stripe-connect"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "conditional"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/marketplace"
---

# Content

## Current implementation

Marketplace is a vendor portal, installable Saleor App, vendor-scoped GraphQL gateway, and
payment/settlement backend. Vendors can register and authenticate, onboard a Stripe Connect
account, manage products, variants, stocks, channel listings and collections, work with orders
and drafts, inspect customers, and configure vendor branding, channels, warehouses, and profile
data.

`/api/graphql` stitches and filters the Saleor schema, restricts root operations, injects
vendor metadata, and checks ownership. The Saleor App surface provides vendor administration,
payout overview, options, manifest/register/bootstrap endpoints, and vendor status management.

Marketplace payments aggregate multiple Saleor sub-checkouts into one Stripe PaymentIntent.
Successful payment events finalize checkout transactions and can feed the optional Postgres
ledger. Operators can close payout periods and execute idempotent Stripe Transfers to Connect
accounts.

## Conditional behavior and gaps

- Saleor installation/configuration, Stripe keys/webhooks, and SMTP are external prerequisites.
- Ledger and payout batches require `DATABASE_URL`; the rest of the portal can run without it.
- Dashboard, several navigation actions, address-book mutations, and product media upload have
  placeholder or disabled UI.
- Ledger currently records `order_gross`; fee/refund/adjustment entry types exist in schema but
  are not populated. Batch fees are zero and settlement stops at Connect Transfers, not bank payouts.
- The local JWT validator decodes claims and expiration but does not verify the token signature
  with Saleor JWKS.
- The `order-created` webhook reads and logs the Saleor signature header but does not verify it.
- Payout authorization and other webhook/auth checks need production-hardening evidence.

## Direction and gaps

Marketplace remains an active product direction. Monorepo integration, multivendor cart, vendor
payment, and seller-order splitting are treated as established slices, while registration gaps
remain open. Code therefore aligns with a substantial but active product, not a finished or
production-proven one. Detailed ledger and batch behavior is more specific than documented
product direction.

## Evidence

Primary paths: `apps/marketplace/src/app`, `apps/marketplace/src/lib/graphql`,
`apps/marketplace/src/lib/ledger`, `apps/marketplace/src/lib/stripe`,
`apps/marketplace/src/services`, and `apps/marketplace/db/drizzle/0000_init_ledger.sql`.

# Related Notes

[Marketplace Operations](../capabilities/Marketplace%20Operations.md)
[Ledger And Payouts](../capabilities/Ledger%20And%20Payouts.md)
[Stripe Integration](../../tech/integrations/Stripe.md)
