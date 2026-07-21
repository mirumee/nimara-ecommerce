---
type: "Product Capability"
title: "Swappable Storefront Search and Content Providers"
description: "The storefront can select search and content implementations through build-time configuration without changing its feature code."
tags:
  - "capability"
  - "storefront"
  - "integrations"
  - "search"
  - "content"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "CAP-0001"
status: "active"
owner: "engineering"
relations:
  integrations:
    - "[Search Provider Selection](../integrations/INT-0001%20Search%20Provider%20Selection.md)"
    - "[Content Provider Selection](../integrations/INT-0002%20Content%20Provider%20Selection.md)"
availability:
  since: "v2.1.0"
  deprecated_since: null
---

# Behavior

The storefront selects one search provider and one content provider at build time. Search,
content-page, and content-menu consumers keep using their existing service interfaces; provider
selection, provider-specific configuration, and construction stay behind infrastructure selectors
and storefront lazy loaders.

Search and content default to the commerce backend provider. A non-production storefront without
that backend configured uses built-in sample search, pages, and menus so a fresh checkout remains
explorable. The same unconfigured production deployment uses empty services, preventing sample
catalog or content data from appearing on a live storefront.

Each selected service is constructed on first use and cached for later calls. Operators can inspect
the effective selection and missing provider configuration with the integration preflight before
building or deploying.

# Actors

- Storefront operators choose providers and supply their configuration.
- Storefront developers add or maintain provider manifests without changing feature consumers.
- Shoppers receive search results, content pages, and navigation from the selected implementations.

# Inputs and outputs

- `SEARCH_SERVICE` selects the search implementation and produces a service for product search,
  facets, and sort options.
- `CMS_SERVICE` selects one content implementation for both pages and menus and produces the two
  corresponding services.
- Provider-specific, server-side environment values supply endpoints, credentials, and index
  settings only for the selected implementation.
- The preflight produces a per-capability report containing the effective provider and any missing
  or invalid configuration keys.

# Constraints and failure behavior

- Provider selection is build-time configuration; changing it requires a rebuild and redeploy.
- Content pages and menus share one provider ID and a common provider catalog, so they cannot drift
  to independently selected implementations.
- Explicitly selecting a provider without its required configuration fails service construction;
  preflight reports the same missing or invalid values before runtime.
- Built-in sample providers require no external credentials but are an automatic fallback only
  outside production. Production falls back to empty services when the default backend is absent.
- A provider-specific upstream failure retains that provider's existing service-level error
  semantics; selection does not introduce cross-provider failover.
