---
type: "Integration Contract"
title: "Saleor Commerce Backend"
description: "GraphQL, app, and webhook contracts that connect storefront, marketplace, and payment surfaces to Saleor commerce state."
tags:
  - "integration"
  - "saleor"
  - "graphql"
  - "commerce-backend"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0006"
status: "active"
owner: "engineering"
availability:
  since: "v1.0.0"
  deprecated_since: null
---

# Purpose

Saleor is the system of record for the product's core commerce state: channels, catalog and
pricing, availability, customers, carts and checkouts, orders, and fulfillment. The storefront
uses domain-facing services in `packages/infrastructure` rather than importing generated Saleor
types into application components. Marketplace and payment-app surfaces use their own boundary
clients where their authentication, domain-routing, and webhook needs differ.

Provider selection can replace selected search and content implementations, but the current cart,
checkout, customer, order, marketplace, agent-commerce, and payment-app paths still depend on a
reachable Saleor deployment.

# Authentication and permissions

- Public storefront reads can call GraphQL without a token. Customer-specific operations pass the
  buyer's bearer token, while privileged storefront operations use the configured app token.
- Marketplace browser operations use the authenticated vendor token and route through the
  marketplace GraphQL boundary. An application-bridge or configured domain header selects the
  Saleor instance associated with the request.
- The payment application is installed through its manifest and registration endpoint. It stores
  the received application token for Saleor operations and verifies signed webhook payloads using
  the deployment's key set before processing them.
- Credentials, app tokens, API URLs, and webhook secrets are deployment configuration and must not
  cross into unauthenticated client code.

# Events and operations

1. Code generation fetches the schema from the configured Saleor API and emits typed documents used
   by the repository's GraphQL operations.
2. Storefront infrastructure services query catalog, channel, content, customer, and order state,
   and mutate carts, checkout details, checkout completion, accounts, and fulfillment.
3. Marketplace requests pass through its GraphQL boundary and compose Saleor state with vendor
   authorization and marketplace-specific views.
4. The payment application registers a Saleor app manifest and handles gateway initialization,
   transaction processing, charging, cancellation, refund, and asynchronous payment webhooks.
5. Saleor event webhooks trigger product and content cache updates and marketplace order-paid
   processing where those features are configured.

# Failure handling and idempotency

- The shared infrastructure GraphQL client maps transport, malformed-response, and GraphQL errors
  into `Result` failures. Domain-facing services then map expected backend errors into their own
  operation contracts.
- Marketplace and payment-app boundaries have additional routing and verification failure modes;
  callers must handle their documented HTTP or application errors rather than assuming the shared
  client behavior applies everywhere.
- GraphQL mutations do not have one repository-wide idempotency guarantee. A consumer must rely on
  the specific operation's identifiers, webhook deduplication, or local idempotency contract.
- Webhook consumers verify the applicable signature before mutation. Invalid signatures,
  unrecognized domains, missing configuration, and unavailable Saleor endpoints stop processing.

# Limitations

- The repository does not pin one Saleor server version. Code generation reads the live schema at
  `NEXT_PUBLIC_SALEOR_API_URL`; the committed generated schema is the compile-time compatibility
  snapshot, not a deployment guarantee.
- Schema regeneration can make all curated schema notes stale at once. A deployment must regenerate
  and test against its target Saleor instance before release.
- Search and content provider registries do not remove the core Saleor dependency from cart,
  checkout, customer, order, marketplace, or payment behavior.
- Availability and correctness depend on channel configuration, permissions, app installation,
  webhook registration, and credentials outside this repository.

# Provenance

- Availability starts with the public
  [`v1.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/26aa9e6d319334f0fd3610911edea46e841c8ef5),
  which already contains the
  [shared GraphQL client](https://github.com/mirumee/nimara-ecommerce/blob/26aa9e6d319334f0fd3610911edea46e841c8ef5/packages/infrastructure/src/graphql/client.ts)
  and Saleor-backed storefront commerce paths.
- The current public snapshot
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005)
  contains the
  [storefront infrastructure services](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005/packages/infrastructure/src),
  [marketplace GraphQL boundary](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/lib/graphql/client.ts),
  [payment-app manifest](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/api/saleor/manifest/route.ts),
  and
  [generated schema snapshot](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/packages/codegen/schema.ts)
  described by this contract.
