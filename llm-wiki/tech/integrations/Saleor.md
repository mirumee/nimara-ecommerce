---
type: "Integration Note"
title: "Saleor"
description: "Primary commerce backend and metadata platform for storefront, marketplace, Stripe App, ACP, and UCP flows."
tags:
  - "integration"
  - "saleor"
  - "graphql"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "conditional"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "packages/infrastructure/src"
  - "apps/storefront/src/app/api/webhooks/saleor"
  - "apps/marketplace/src/app/api/saleor"
  - "apps/stripe/src/app/api/saleor"
  - "packages/codegen/schema.ts"
---

# Content

## Current implementation

Saleor supplies catalog, pricing, channels, checkout/order, customers, addresses, fulfillment,
metadata, and default CMS/search behavior. Storefront infrastructure wraps GraphQL operations
behind typed capability services. Signed Saleor webhooks invalidate storefront caches.

Marketplace and Stripe are installable Saleor Apps with manifest/register endpoints. Marketplace
uses Saleor Pages and metadata for vendor identity and a stitched GraphQL gateway for scoped
operations. Stripe App integrates Saleor's Payment Gateway and Transaction APIs.

## Direction and gaps

Nimara's committed generated schema is the code-level compatibility pin, not a fixed server
version. A Saleor upgrade remains planned, while active Marketplace and operational-stabilization
work depends heavily on Saleor. Some marketplace webhooks and authentication checks require
stronger production evidence. The supported server-version policy is not explicit, and current
direction does not close those hardening gaps.

## Evidence

Infrastructure GraphQL/services, application Saleor endpoints, and `packages/codegen/schema.ts`.
Use version-stamped notes under `tech/saleor/` for field-level schema details.

# Related Notes

[Saleor Schema](../saleor/Saleor%20Schema%20%28MOC%29.md)
[Service And Provider Architecture](../architecture/Service%20And%20Provider%20Architecture.md)
[Marketplace](../../system/applications/Marketplace.md)
