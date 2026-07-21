---
type: "Integration Contract"
title: "Agent-Compatible Storefront API"
description: "Discovery and channel-aware commerce API contract for negotiated agent access to catalog, cart, checkout, and order operations."
tags:
  - "integration"
  - "storefront"
  - "agent-commerce"
  - "ucp"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0004"
status: "active"
owner: "engineering"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Purpose

The storefront exposes an agent-compatible REST surface under
`/api/ucp/{channelSlug}`. A static `/.well-known/ucp` profile advertises the protocol version,
shopping service endpoint, transport, schemas, and supported capabilities before a platform calls
catalog, cart, checkout, or order operations.

The capability registry covers checkout, order, cart, catalog search, catalog lookup, discounts,
buyer consent, and fulfillment. Each successful or protocol-level error response reports the
negotiated version and the capabilities relevant to that operation.

# Authentication and permissions

- Each API request supplies a `UCP-Agent` header containing the caller's HTTPS discovery-profile
  URL ending in `/.well-known/ucp`; HTTP is accepted only in development.
- The storefront fetches that profile with redirects disabled and a three-second timeout. This
  validates protocol compatibility, not caller identity: these routes currently do not enforce an
  authorization token or request signature.
- Every commerce route validates its `channelSlug` path parameter and creates its commerce service
  for that channel. Resource IDs are interpreted within the requested channel contract.

# Events and operations

1. `GET /.well-known/ucp` returns a cacheable, statically generated business profile with the REST
   service and capability registry.
2. Before commerce work, the storefront requires the caller profile's protocol version to exactly
   match its supported version. It intersects capability names and versions, chooses the highest
   common version, and removes extension capabilities whose parent was not negotiated.
3. Channel-aware catalog endpoints search products, look up products, and retrieve one product.
4. Channel-aware cart endpoints create, retrieve, update, and cancel carts.
5. Channel-aware checkout-session endpoints create, retrieve, update, complete, and cancel
   checkout sessions. Order lookup returns the completed order representation.
6. Recoverable commerce validation is returned as protocol messages. Buyer-input or buyer-review
   errors make checkout status `requires_escalation` and include a `continue_url` that hands the
   interaction to the storefront UI.

# Failure handling and idempotency

- Invalid, unreachable, malformed, version-incompatible, or capability-incompatible caller profiles
  stop request processing with a structured negotiation response.
- Checkout-session routes and order lookup accept `Idempotency-Key` and replay a cached response for
  the same key. Reusing a mutation key with a different body returns HTTP 409.
- The cache is process-local memory with a 24-hour lifetime. It is not shared across replicas or
  retained across restarts, so it does not provide deployment-wide idempotency.
- Catalog and cart routes do not currently use idempotency keys. Clients must not assume replay
  protection for cart mutations.
- When checkout needs buyer action, `continue_url` is the recovery boundary: the agent pauses and
  the buyer resumes the same checkout through the storefront.

# Limitations

- Discovery and checkout responses currently advertise an empty `payment_handlers` registry.
  Checkout can collect and validate state, but the protocol surface does not expose a negotiated
  payment handler for autonomous payment completion.
- The route and UCP feature directories in the release snapshot contain no scoped test files for
  discovery, negotiation, catalog, cart, checkout-session, or order behavior. Current behavior is
  therefore evidenced by implementation, not dedicated tests at this boundary.
- The discovery profile advertises one endpoint derived from the configured default channel while
  runtime operations still require an explicit channel slug. Multi-channel clients must learn
  additional channel slugs outside discovery.
- Caller discovery-profile validation is capability negotiation rather than authentication or
  authorization. A deployment must not treat the `UCP-Agent` header as proof of identity.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [well-known discovery profile](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/.well-known/ucp/route.ts),
  [capability registry](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/features/ucp/capabilities.ts),
  [version and caller-profile negotiation](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/features/ucp/version-negotiation.ts),
  [channel-aware route tree](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/api/ucp/%5BchannelSlug%5D),
  and
  [idempotency store](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/features/acp/acp.ts)
  described above.
