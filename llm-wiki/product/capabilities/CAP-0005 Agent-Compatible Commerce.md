---
type: "Product Capability"
title: "Agent-Compatible Commerce"
description: "Channel-aware catalog, cart, checkout-session, and order access for commerce agents through a discoverable negotiated API."
tags:
  - "capability"
  - "agent-commerce"
  - "storefront"
  - "ucp"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "CAP-0005"
status: "active"
owner: "product-and-engineering"
relations:
  integrations:
    - "[Agent-Compatible Storefront API](../integrations/INT-0004%20Agent-Compatible%20Storefront%20API.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Behavior

An external commerce agent can discover the storefront's machine-readable profile, negotiate a
supported protocol version and capability set, then operate against a channel-specific catalog,
cart, checkout-session, and order surface. The storefront translates those operations into its
Saleor-backed commerce model and returns protocol-shaped resources, validation messages, and
browser handoff links.

This capability makes the product inspectable and operable by protocol clients without exposing
the storefront's internal GraphQL contract. It does not make checkout fully autonomous: the
storefront can require buyer review and hand control to its web checkout.

# Actors

- A commerce agent or agent platform discovers the storefront and invokes negotiated operations.
- A buyer supplies consent, contact, fulfillment, and payment-dependent decisions when required.
- A storefront operator configures the public storefront URL, channel, and Saleor commerce
  backend.

# Inputs and outputs

- Discovery takes no commerce resource input and returns the supported protocol version, service
  endpoint, schemas, transport, and capability registry.
- Commerce requests identify a channel and include a caller discovery-profile URL. Catalog inputs
  include search, lookup, and product identifiers; cart and checkout inputs include variant IDs,
  quantities, buyer data, addresses, fulfillment choices, and discounts.
- Successful outputs are protocol-shaped products, carts, checkout sessions, or orders with the
  negotiated metadata. Recoverable validation outputs include structured messages, state, and a
  `continue_url` when the buyer must resume in the storefront.

# Constraints and failure behavior

- The caller's advertised protocol version must exactly match the storefront version, and only
  mutually supported capabilities are returned.
- The caller profile must be available over a permitted URL and every operation must use a valid
  configured channel. Profile negotiation establishes compatibility, not caller identity or
  authorization.
- Checkout-session replay protection is process-local and does not survive restarts or span
  replicas. Catalog and cart mutations do not provide the same idempotency contract.
- Payment-handler discovery and checkout completion do not by themselves authorize or execute a
  payment. Clients must honor checkout state and browser-handoff instructions instead of assuming
  an unattended purchase completed.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [well-known discovery profile](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/.well-known/ucp/route.ts),
  [version and capability negotiation](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/features/ucp/version-negotiation.ts),
  [channel-aware commerce route tree](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/api/ucp/%5BchannelSlug%5D),
  and
  [Saleor-backed protocol service](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/packages/infrastructure/src/ucp/saleor/service.ts)
  that make the capability active.
