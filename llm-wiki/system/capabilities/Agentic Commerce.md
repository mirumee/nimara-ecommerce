---
type: "Capability"
title: "Agentic Commerce"
description: "ACP and UCP protocol facades exposing Nimara catalog, cart, checkout, and order behavior to external agents."
tags:
  - "capability"
  - "ucp"
  - "acp"
  - "agentic-commerce"
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

## Current implementation

Legacy ACP exposes a product feed and checkout-session create/get/update/complete routes. UCP
publishes a discovery profile and implements catalog search/lookup/product, carts, checkout
sessions, and orders with version/capability negotiation. Declared UCP capabilities cover
checkout, order, discounts, buyer consent, fulfillment, cart, and catalog discovery.

## Direction and gaps

UCP depends on Saleor and currently advertises no payment handlers. Order adjustment returns
`422`. AP2 merchant-authorization, checkout-mandate, and checkout-terms validation functions are
dummy implementations that return success rather than performing cryptographic verification.
Version matching is exact for `2026-04-08`, not range-based. If checkout completion succeeds but
the follow-up fetch fails, the degraded response hard-codes USD, empty lines, and zero totals.

ACP and UCP coexist, and idempotency is in-memory rather than durable. ACP/UCP endpoint and
schema delivery is treated as done, but no explicit direction covers AP2 verification, durable
idempotency, order adjustment, payment handlers, or ACP retirement. The code is therefore
partial against broader protocol expectations despite the completed delivery scope.

## Evidence

Primary paths: storefront ACP/UCP routes and features plus infrastructure ACP/UCP services.

# Related Notes

[Storefront](../applications/Storefront.md)
[ACP And UCP](../../tech/integrations/ACP%20And%20UCP.md)
[Marketplace And Agentic Commerce Bets](../../product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md)
