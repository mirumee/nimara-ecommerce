---
type: "Integration Contract"
title: "Content Provider Selection"
description: "Build-time contract for selecting one storefront content implementation for both pages and menus."
tags:
  - "integration"
  - "storefront"
  - "content"
  - "provider-selection"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0002"
status: "active"
owner: "engineering"
availability:
  since: "v2.1.0"
  deprecated_since: null
---

# Purpose

`CMS_SERVICE` selects one storefront content implementation for both pages and menus at build time.
Supported provider IDs are `saleor`, `butter-cms`, and `dummy`; `saleor` is the default. Page and
menu consumers continue to use their separate shared service interfaces while both selectors are
keyed by the same canonical provider catalog.

Each provider manifest owns its configuration schema, configuration mapping, and lazy factory.
Page and menu manifests must cover the same provider IDs, making incomplete content-provider wiring
a compile-time error.

# Authentication and permissions

- Selection and provider configuration are read on the server.
- The `saleor` provider requires `NEXT_PUBLIC_SALEOR_API_URL` and reads content available through
  that GraphQL endpoint.
- The `butter-cms` provider requires the server-side `CMS_BUTTER_TOKEN` for both pages and menus.
  Deployments own token scope, storage, and rotation.
- The `dummy` provider is local sample data and requires no credentials.

# Events and operations

1. The server environment parses `CMS_SERVICE`, applying `saleor` when the value is absent.
2. The storefront resolves one effective provider for both content capabilities, including the
   environment-sensitive fallback for an unconfigured default backend.
3. The first page or menu service request lazily imports and constructs that capability's selected
   implementation.
4. Later requests reuse the cached page or menu service instance.
5. Integration preflight validates both selected manifests and reports content-page and
   content-menu configuration separately.

# Failure handling and idempotency

- An unsupported `CMS_SERVICE` value fails environment validation.
- An explicitly selected provider with missing or invalid configuration fails page and menu service
  construction instead of silently switching to another external provider.
- When the default `saleor` provider is unconfigured, non-production uses the sample page and menu
  implementations; production uses the corresponding empty services.
- Each lazy loader constructs its service at most once after a successful build. Pages and menus
  have separate cached instances even though they share the selected provider ID.

# Limitations

- A deployment has one content provider for both pages and menus; the two capabilities cannot be
  configured independently.
- Selection cannot vary per request, locale, channel, or shopper, and changing build-time
  configuration requires a rebuild and redeploy.
- Content models and authoring workflows remain provider-specific even though consumers use shared
  page and menu service interfaces.
- The contract validates configuration and constructs the selected services; it does not perform
  runtime failover between external providers.
