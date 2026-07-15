---
type: "Saleor Schema Note"
title: "Shop, Channels & Warehouses"
description: "Saleor Shop (incl. version), Channel, Warehouse, and the Money/TaxedMoney money model."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "shop"
  - "channels"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

**Channels** are Saleor's multi-market primitive. A channel owns currency, country
availability, and pricing; most catalog/checkout queries take a `channel` slug and resolve
prices, availability, and shipping against it.

**Key types**

- `Shop` (`ObjectWithMetadata`) — instance-wide config: `countries` (`CountryDisplay[]`),
  `defaultCountry`, `channelCurrencies`, `permissions`, `domain`, and **`version: String!`**.
  `Shop.version` is the running Saleor server version — the authoritative _runtime_ version.
  Nimara does not currently query it (compatibility is enforced by the generated types, whose
  stamp these notes carry — see [Saleor Schema (MOC)](./Saleor%20Schema%20%28MOC%29.md)).
- `Channel` (`Node & ObjectWithMetadata`) — `slug`, `name`, `currencyCode`, `defaultCountry`,
  `isActive`, `countries`.
- `Warehouse` (`Node & ObjectWithMetadata`) — stock location backing availability and shipping
  zones; drives `quantityAvailable`.

**Money model.** All prices are `Money` (`amount`, `currency`) or, where tax applies,
`TaxedMoney` (`net`, `gross`, `tax` — each a `Money`). Never treat an amount as a bare number
without its currency.

**Nimara usage**

Channel/region resolution and shop config live in `packages/infrastructure/src/{store,config}`
and are read in storefront layouts (region/menu shell). `NEXT_PUBLIC_SALEOR_API_URL` selects
the Saleor instance; unset = zero-config empty mode.

## Related Notes

[Saleor Schema (MOC)](./Saleor%20Schema%20%28MOC%29.md)
[Products & Variants](./Products%20%26%20Variants.md)
[Checkout & Payments](./Checkout%20%26%20Payments.md)
