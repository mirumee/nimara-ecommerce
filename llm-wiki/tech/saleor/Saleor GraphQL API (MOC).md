---
type: "Map of Content"
title: "Saleor GraphQL API (MOC)"
description: "Map of Content for the Saleor GraphQL API reference — entry point to per-domain notes synthesized from the archived Saleor schema."
tags:
  - "saleor"
  - "graphql"
  - "api"
  - "moc"
  - "index"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Reference map for the **Saleor GraphQL API**, the backend commerce contract Nimara's
storefront consumes. Notes are synthesized from the archived schema
(source: [schema.graphql](/sources/saleor/schema.graphql)); the schema file remains the
source of truth for exact field-level detail.

Start with [Saleor API Overview](/tech/saleor/Saleor%20API%20Overview.md) for roots, scale,
and cross-cutting conventions (Relay pagination, `Node`/`ObjectWithMetadata`, channel
scoping, money types, permissions).

### Catalog
- [Products & Variants](/tech/saleor/Products%20%26%20Variants.md) — products, purchasable variants, product types, media, per-channel pricing.
- [Attributes](/tech/saleor/Attributes.md) — typed metadata definitions and values assigned to products, variants, and pages.
- [Categories & Collections](/tech/saleor/Categories%20%26%20Collections.md) — the category tree and curated, per-channel-published collections.

### Selling flow
- [Checkout](/tech/saleor/Checkout.md) — the cart/session that converts into an order.
- [Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md) — orders, draft orders, fulfillments, invoices.
- [Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md) — legacy payments and the modern transaction API.

### Organization
- [Accounts & Permissions](/tech/saleor/Accounts%20%26%20Permissions.md) — users, addresses, staff, permission groups, auth.
- [Channels](/tech/saleor/Channels.md) — the multi-market / multi-currency axis everything hangs off.

### Logistics
- [Warehouses & Stock](/tech/saleor/Warehouses%20%26%20Stock.md) — inventory locations, stock, allocation.
- [Shipping](/tech/saleor/Shipping.md) — zones, methods, per-channel prices, postal-code rules.
- [Taxes](/tech/saleor/Taxes.md) — per-channel/per-country tax configuration and classes.

### Value & promotions
- [Discounts](/tech/saleor/Discounts.md) — vouchers, legacy sales, and the promotion/rule model.
- [Gift Cards](/tech/saleor/Gift%20Cards.md) — prepaid store-credit instruments.

### Platform & extensibility
- [Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md) — CMS pages, page types, menus.
- [Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md) — apps, tokens, dashboard extensions, webhooks, plugins.
- [Translations](/tech/saleor/Translations.md) — multi-language content and the `*Translate` family.

## Related Notes
[Saleor API Overview](/tech/saleor/Saleor%20API%20Overview.md)
[ADR MOC](/tech/ADR/ADR%20MOC.md)
[Competitor Landscape](/product/market/Competitor%20Landscape.md)
[Saleor Schema Source](/sources/saleor/schema.graphql)
