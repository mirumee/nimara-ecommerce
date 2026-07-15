---
type: "Saleor Schema Note"
title: "Attributes & Metadata"
description: "Saleor Attribute input types and the ObjectWithMetadata key/value extension pattern."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "attributes"
  - "metadata"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

Two distinct extension mechanisms are easy to confuse: **attributes** (structured, typed,
merchant-configured catalog data) and **metadata** (free-form key/value bags on almost any
object).

**Attributes**

- `Attribute` (`Node & ObjectWithMetadata`) — `slug`, `name`, `inputType`
  (`AttributeInputTypeEnum`), `type` (`AttributeTypeEnum`: `PRODUCT_TYPE` | `PAGE_TYPE`),
  `choices` (`AttributeValue[]`), and flags like `filterableInStorefront`.
- `AttributeValue` — `slug`, `name`, and type-specific payloads (`value`, `boolean`, `date`,
  `dateTime`, `richText`, `plainText`, `file`, `reference`).
- `SelectedAttribute` — an `Attribute` + its selected `values`, as returned on `Product`/
  `ProductVariant`.
- `AttributeInputTypeEnum` (this version): `DROPDOWN`, `MULTISELECT`, `SWATCH`, `BOOLEAN`,
  `NUMERIC`, `DATE`, `DATE_TIME`, `PLAIN_TEXT`, `RICH_TEXT`, `FILE`, `REFERENCE`,
  `SINGLE_REFERENCE`. Match rendering to the input type.

**Metadata**

- `ObjectWithMetadata` — implemented by `Product`, `ProductVariant`, `Order`, `Checkout`,
  `User`, `Channel`, `Warehouse`, `Shop`, and more. Exposes `metadata` and `privateMetadata`
  (both `Metadata`, i.e. `Record<string, string>`), read via `metafield(s)`.
- Written with `updateMetadata` / `deleteMetadata` (public) and the `private*` variants
  (staff/app only). Nimara stores integration data here — e.g. marketplace vendor and Stripe
  Connect references used by the checkout flow.

**Nimara usage**

Attribute rendering appears in catalog/search under `packages/infrastructure/src/search` and
product detail; metadata is used pervasively for cross-app coupling (marketplace vendor tags,
CMS references). Treat `Metadata` values as strings — serialize/parse structured data yourself.

## Related Notes

[Saleor Schema (MOC)](./Saleor%20Schema%20%28MOC%29.md)
[Products & Variants](./Products%20%26%20Variants.md)
