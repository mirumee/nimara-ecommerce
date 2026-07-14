---
type: "Saleor Schema Note"
title: "Products & Variants"
description: "Saleor catalog types: Product, ProductVariant, pricing, attributes, and availability."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "catalog"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

The catalog is modelled as `Product` → `ProductVariant`. A product groups shared marketing
data; each purchasable SKU is a variant. Most catalog fields are **channel-aware**: pricing
and availability only resolve when a query passes a `channel` slug.

**Key types**

- `Product` (`Node & ObjectWithAttributes & ObjectWithMetadata`) — fields include `id`,
  `name`, `slug`, `description` (`JSONString`, Editor.js), `category`, `collections`,
  `productType`, `defaultVariant`, `variants`, `media`/`thumbnail`, `attributes`
  (`SelectedAttribute[]`), `pricing` (`ProductPricingInfo`), `isAvailable`, `rating`, and SEO
  fields. `pricing`, `isAvailable`, and `channel` require a channel context.
- `ProductVariant` (`Node & ObjectWithAttributes & ObjectWithMetadata`) — the SKU: `sku`,
  `name`, `pricing` (`VariantPricingInfo`), `quantityAvailable`, `attributes`, and stock.
- `ProductPricingInfo` / `VariantPricingInfo` — `priceRange`/`price` as `TaxedMoney`, plus
  `onSale` and `discount`. Money is always `TaxedMoney` (`net`, `gross`, `tax`) — see
  [Shop, Channels & Warehouses](tech/saleor/Shop%2C%20Channels%20%26%20Warehouses.md).
- `ProductType` — defines whether the product has variants and which attributes apply.
- `Category` / `Collection` — taxonomy; collections are channel-scoped for listing.

**Attributes** on products/variants use `SelectedAttribute` (an `Attribute` plus its
`AttributeValue[]`). See [Attributes & Metadata](tech/saleor/Attributes%20%26%20Metadata.md).

**Nimara usage**

Catalog reads live in `packages/infrastructure/src/{search,collection,category}/saleor/` and
detail/pricing in `store/saleor/`. Products are always fetched with a channel; never assume a
price without one.

## Related Notes

[Saleor Schema (MOC)](tech/saleor/Saleor%20Schema%20%28MOC%29.md)
[Attributes & Metadata](tech/saleor/Attributes%20%26%20Metadata.md)
[Shop, Channels & Warehouses](tech/saleor/Shop%2C%20Channels%20%26%20Warehouses.md)
