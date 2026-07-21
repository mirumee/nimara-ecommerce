---
type: "Integration Contract"
title: "Search Provider Selection"
description: "Build-time contract for selecting and configuring the storefront product-search implementation."
tags:
  - "integration"
  - "storefront"
  - "search"
  - "provider-selection"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0001"
status: "active"
owner: "engineering"
availability:
  since: "v2.1.0"
  deprecated_since: null
---

# Purpose

`SEARCH_SERVICE` selects the storefront's product-search implementation at build time. Supported
provider IDs are `saleor`, `algolia`, and `dummy`; `saleor` is the default. Every implementation
supplies the shared search service operations for product results, facets, and sort options, so
storefront features do not branch on the selected provider.

Provider manifests own their configuration schema, configuration mapping, and lazy factory. The
provider catalog and the integration preflight are derived from those manifests rather than from
separate hand-maintained lists.

# Authentication and permissions

- Selection and provider configuration are read on the server.
- The `saleor` provider requires `NEXT_PUBLIC_SALEOR_API_URL` and uses the permissions exposed by
  that GraphQL endpoint.
- The `algolia` provider requires `SEARCH_ALGOLIA_APP_ID`, `SEARCH_ALGOLIA_API_KEY`, and
  `SEARCH_ALGOLIA_INDICES`. Deployments are responsible for supplying a search-scoped key with only
  the permissions their storefront requires.
- The `dummy` provider is local sample data and requires no credentials.

# Events and operations

1. The server environment parses `SEARCH_SERVICE`, applying `saleor` when the value is absent.
2. The storefront resolves the effective provider, including the environment-sensitive fallback
   for an unconfigured default backend.
3. The first search-service request lazily imports and constructs the selected implementation.
4. Later requests reuse the cached service instance.
5. Integration preflight validates the selected manifest's environment schema and reports its
   effective provider and missing or invalid keys.

# Failure handling and idempotency

- An unsupported `SEARCH_SERVICE` value fails environment validation.
- An explicitly selected provider with missing or invalid configuration fails construction instead
  of silently selecting a different external provider.
- When the default `saleor` provider is unconfigured, non-production uses `dummy`; production uses
  the empty search service.
- Lazy construction is idempotent within the service loader: after the first successful build, the
  same instance is returned on subsequent calls.

# Limitations

- A deployment has one search provider at a time; selection cannot vary per request, channel, or
  shopper.
- Changing the provider or its build-time environment requires a rebuild and redeploy.
- Index shape, filtering, sorting, and relevance configuration remain provider-specific even though
  the storefront consumes one shared service interface.
- The contract validates configuration and constructs the selected service; it does not perform
  runtime failover between external providers.
