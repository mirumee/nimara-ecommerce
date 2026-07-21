---
type: "Product Capability"
title: "Marketplace Vendor Operations"
description: "Vendors can manage their commerce profile, catalog, customers, and orders through a vendor-isolated marketplace workspace, including connected-account setup."
tags:
  - "capability"
  - "marketplace"
  - "vendors"
  - "operations"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "CAP-0004"
status: "active"
owner: "engineering"
relations:
  integrations:
    - "[Stripe Connect Vendor Accounts and Transfers](../integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Behavior

The marketplace provides a dedicated workspace for vendor registration, account confirmation,
sign-in, and day-to-day commerce operations. An approved vendor can manage its profile and
addresses, inspect available channels and warehouses, and connect or revisit its Stripe Express
account.

The catalog workspace lets a vendor list, search, create, update, publish, and delete its products,
variants, media, stock, channel listings, and collections. The order workspace supports vendor
draft orders and assigned customer orders, including line and discount changes, fulfillment,
cancellation, notes, and manual payment marking where the commerce backend permits the requested
transition.

The marketplace GraphQL boundary exposes only an allowlisted subset of the commerce schema. For
authenticated vendor operations it resolves the user's vendor profile identifier, injects that
identifier into newly created or updated objects, filters list queries by vendor metadata, and
checks ownership before sensitive single-object reads and mutations.

# Actors

- Vendors register, await activation, and operate only the catalog, customer, order, configuration,
  and payment-account data assigned to their profile.
- Marketplace administrators install and configure the marketplace app, review vendor profiles,
  and activate or reject vendor registrations.
- The commerce backend stores identities, profiles, catalog objects, customers, and orders and
  applies the permissions and state transitions requested through the marketplace.
- Stripe Connect creates vendor Express accounts and exposes onboarding and dashboard links.

# Inputs and outputs

- Registration input includes an account identity and vendor profile data. Successful setup creates
  the account, vendor profile, default vendor collection, metadata links, and an activation request.
- Catalog input includes product, variant, media, stock, collection, and channel-listing changes.
  Output is the corresponding vendor-tagged commerce object or structured GraphQL errors.
- Order input includes vendor-scoped order or draft-order identifiers and the requested line,
  discount, fulfillment, cancellation, note, or payment-state change. Output is the updated order
  payload or an ownership, permission, validation, or state-transition error.
- Configuration input includes profile, address, channel, warehouse, and connected-account actions.
  Output is refreshed marketplace state or an explicit failure result.

# Constraints and failure behavior

- The marketplace must be installed and bootstrapped against a commerce domain. Missing app
  configuration prevents registration and operations that require the app token.
- Vendor operations require a valid user token and a resolvable vendor-profile identifier in user
  metadata. Missing or invalid authentication is rejected. A temporarily throttled metadata lookup
  returns a retryable throttling error instead of dropping vendor isolation.
- The GraphQL boundary owns vendor isolation. It filters vendor lists by metadata and rejects
  single-object changes whose metadata does not match the authenticated vendor. Direct backend
  permissions and marketplace metadata must therefore stay aligned.
- Customer visibility is derived from customer identifiers accumulated on the vendor profile and
  is not an independent customer-ownership model. Missing or stale metadata can make a legitimate
  customer absent from the workspace.
- Connected-account onboarding remains distinct from payout eligibility. A completed profile does
  not make transfers executable unless Stripe also reports payouts enabled.
- Failure of a commerce mutation leaves its object unchanged but does not roll back earlier,
  separately completed setup or notification work unless that workflow explicitly performs its
  best-effort cleanup.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [vendor-isolating GraphQL boundary](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/graphql/server/schema.ts),
  [vendor authentication context](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/graphql/server/auth.ts),
  [authenticated marketplace workspace](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/%28authenticated%29),
  and
  [connected-account actions](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/%28authenticated%29/_actions/stripe-connect.ts)
  described above.
