---
type: "Map of Content"
title: "Saleor Schema (MOC)"
description: "Map of Content for curated notes on Saleor's GraphQL schema, version-stamped to the schema Nimara's codegen currently uses."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "moc"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

These notes describe the parts of the **Saleor GraphQL API** Nimara builds on. They are
curated per domain (one idea per note), not an auto-generated dump of every type.

### Why these notes are version-stamped

Nimara does not pin a Saleor version. It connects only through `NEXT_PUBLIC_SALEOR_API_URL`,
and `pnpm codegen` fetches the schema **live from that URL**, writing generated types to
`packages/codegen/schema.ts`. That committed file is the de-facto pin: it changes only when
someone re-runs codegen against a (possibly different) Saleor instance.

Each note carries a `saleor_schema_hash` — the short sha256 of `packages/codegen/schema.ts`
it was written against. This lets an agent confirm a note still matches the schema the code
actually uses.

### Freshness workflow

- **Before citing** any note here, run `pnpm wiki:saleor:check`. `OK` = the note matches the
  current schema; `STALE` = the schema was regenerated and the note needs review.
- **When authoring or updating** a note, stamp it with the current value from
  `pnpm wiki:saleor:hash`.
- A `STALE` result is expected after `pnpm codegen` (see the `codegen-check` skill) changes
  `packages/codegen/schema.ts`. Review the affected notes against the new schema, then restamp.

The stamp is a whole-schema hash, so any regeneration flags every Saleor note for review,
even domains that did not change. This is intentional — a conservative, simple freshness gate.

## Register

- [Products & Variants](tech/saleor/Products%20%26%20Variants.md) — catalog: `Product`, `ProductVariant`, pricing, availability.
- [Checkout & Payments](tech/saleor/Checkout%20%26%20Payments.md) — `Checkout`, lines, gateways, and the Transactions API.
- [Orders & Fulfillment](tech/saleor/Orders%20%26%20Fulfillment.md) — `Order`, status enums, `Fulfillment`, payment status.
- [Account & Auth](tech/saleor/Account%20%26%20Auth.md) — `User`, `Address`, JWT token mutations.
- [Shop, Channels & Warehouses](tech/saleor/Shop%2C%20Channels%20%26%20Warehouses.md) — `Shop` (incl. `version`), `Channel`, `Warehouse`.
- [Attributes & Metadata](tech/saleor/Attributes%20%26%20Metadata.md) — `Attribute` input types and the `metadata` pattern.

## Related Notes

[Agent Instructions](AGENTS.md)
[ADR MOC](tech/ADR/ADR%20MOC.md)
