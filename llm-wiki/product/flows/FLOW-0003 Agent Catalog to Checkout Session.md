---
type: "Product Flow"
title: "Agent Catalog to Checkout Session"
description: "A negotiated commerce agent discovers products and builds a channel-specific checkout session for buyer continuation."
tags:
  - "flow"
  - "agent-commerce"
  - "catalog"
  - "checkout"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "FLOW-0003"
status: "active"
owner: "product-engineering-and-qa"
relations:
  capabilities:
    - "[Agent-Compatible Commerce](../capabilities/CAP-0005%20Agent-Compatible%20Commerce.md)"
  integrations:
    - "[Agent-Compatible Storefront API](../integrations/INT-0004%20Agent-Compatible%20Storefront%20API.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
actors:
  - "commerce-agent"
  - "buyer"
---

# Preconditions

- The storefront publishes its discovery profile and has a valid public URL, default channel, and
  Saleor API connection.
- The commerce agent publishes a reachable discovery profile with the same protocol version and at
  least one compatible catalog, cart, or checkout capability.
- The selected channel contains sellable variants. The agent can obtain any buyer consent or data
  it includes in the checkout request.

# Main flow

1. The agent reads the storefront's `/.well-known/ucp` profile to learn the channel endpoint,
   protocol version, and supported capabilities.
2. The agent sends its own discovery-profile URL with a channel-aware catalog request. The
   storefront fetches the profile, verifies the exact protocol version, and intersects both
   capability registries.
3. The agent searches or looks up catalog products and selects a channel-valid variant identifier.
4. The agent creates a cart or checkout session with one or more variant IDs and quantities. The
   Saleor-backed service creates the underlying checkout and returns normalized line items, totals,
   state, and a continuation link.
5. The agent may update the session with buyer details, addresses, fulfillment selections,
   discounts, or line changes. Each successful response reflects the recalculated checkout state.
6. The agent retains the returned checkout-session identifier and hands the `continue_url` to the
   buyer whenever the response requires review or additional input.

# Failure paths

- A missing, malformed, unreachable, redirected, or version-incompatible caller profile stops the
  operation before commerce work and returns a structured negotiation error.
- An invalid channel, product, variant, quantity, address, discount, or fulfillment choice returns
  protocol messages derived from the backend response. Buyer-action errors set the checkout to
  `requires_escalation` and include a storefront continuation URL.
- Checkout-session routes can replay a response for a supplied idempotency key, but that cache is
  local to one process and expires. Cart creation has no equivalent replay protection, so callers
  must avoid blind retries.
- An unavailable or misconfigured Saleor endpoint prevents catalog and checkout work; no local
  fallback catalog or checkout is created.

# Result

The result is a channel-specific Saleor checkout represented as a protocol checkout session, with a
stable identifier, current line items and totals, state, and a buyer continuation link. This flow
ends at the checkout-session boundary: it does not claim payment authorization, checkout
completion, or order creation.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [catalog search route](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/api/ucp/%5BchannelSlug%5D/catalog/search/route.ts),
  [cart-creation route](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/api/ucp/%5BchannelSlug%5D/carts/route.ts),
  [checkout-session creation route](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/api/ucp/%5BchannelSlug%5D/checkout-sessions/route.ts),
  and
  [Saleor-backed session implementation](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/packages/infrastructure/src/ucp/saleor/service.ts)
  that establish the flow and its boundary.
