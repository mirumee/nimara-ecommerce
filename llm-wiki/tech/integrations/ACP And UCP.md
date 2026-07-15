---
type: "Integration Note"
title: "ACP And UCP"
description: "Agent-facing commerce protocol implementations for catalog discovery, carts, checkout sessions, and orders."
tags:
  - "integration"
  - "acp"
  - "ucp"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "partial"
direction_status: "done"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/app/api/acp"
  - "apps/storefront/src/app/api/ucp"
  - "apps/storefront/src/app/.well-known/ucp"
  - "apps/storefront/src/features/ucp"
  - "packages/infrastructure/src/acp"
  - "packages/infrastructure/src/ucp"
---

# Content

ACP and UCP coexist on the storefront. ACP exposes a product feed and checkout sessions. UCP
version `2026-04-08` publishes discovery and negotiated capabilities for checkout, order,
discount, buyer consent, fulfillment, cart, and catalog search/lookup; routes cover catalog,
cart, checkout-session, and order operations.

The protocols use Saleor services. UCP has no advertised payment handler, order adjustments are
not implemented, and idempotency is in-memory. AP2 mandate verification uses dummy functions
that return success, negotiation requires the exact `2026-04-08` version, and a degraded
post-completion fallback hard-codes USD with no lines and zero totals. ACP uses a global singleton
while UCP caches services per channel. ACP/UCP endpoint and schema delivery is treated as done,
but no explicit lifecycle or hardening direction covers these gaps. Implementation remains
partial against broader protocol expectations.

## Evidence

Storefront discovery/API/features and infrastructure ACP/UCP services at the recorded commit.

# Related Notes

[Agentic Commerce](../../system/capabilities/Agentic%20Commerce.md)
[Storefront](../../system/applications/Storefront.md)
[Saleor](./Saleor.md)
