---
type: "Technical Reference"
title: "Saleor API Overview"
description: "Shape and conventions of the Saleor GraphQL API — the backend commerce contract Nimara's storefront consumes: roots, domains, and cross-cutting patterns."
tags:
  - "saleor"
  - "graphql"
  - "api"
  - "reference"
  - "backend"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Saleor is the Python/Django, GraphQL-first commerce backend Nimara sits on top of (see
[Competitor Landscape](/product/market/Competitor%20Landscape.md)). This note describes the
**shape** of its GraphQL API; the per-domain notes below describe each subsystem. Everything
here is synthesized from the archived schema (source: [schema.graphql](/sources/saleor/schema.graphql)).

### Scale of the contract
The schema defines roughly **885 object types, 314 inputs, 201 enums, 13 unions, 9 interfaces,
16 scalars**, with **86 `Query` root fields**, **~330 `Mutation` fields**, and a
`Subscription` root that backs subscription-query webhooks.

### Roots
- `type Query` — read entry points, mostly single-object lookups (`product`, `order`,
  `checkout`, …) and Relay-style countable connections (`products`, `orders`, …).
- `type Mutation` — all writes, named `<entity><Verb>` (e.g. `checkoutLinesAdd`,
  `productVariantCreate`, `orderFulfill`), with `*Bulk*` variants for batch operations.
- `type Subscription` — event payloads selected by a webhook's `subscriptionQuery`.

### Cross-cutting conventions
- **Relay pagination.** List queries return `*CountableConnection` with `edges`/`node`,
  `pageInfo`, and `totalCount`; use `first`/`after` (or `last`/`before`) cursors.
- **`Node` interface.** Most persisted entities implement `Node` (global `id: ID!`).
- **`ObjectWithMetadata`.** Most entities carry `metadata`/`privateMetadata` (public vs
  staff-only key–value extension storage) — the primary way to attach custom data.
- **`ObjectWithAttributes`.** `Product`, `ProductVariant`, and `Page` expose typed attribute
  values; see [Attributes](/tech/saleor/Attributes.md).
- **Money.** Prices use `Money` (amount + currency) and `TaxedMoney` (net/gross/tax);
  ranges use `MoneyRange`/`TaxedMoneyRange`.
- **Channel scoping.** Prices, publication, and availability are **not global** — they hang
  off a [Channel](/tech/saleor/Channels.md) via `*ChannelListing` join types. Storefront
  reads must pass a `channel` argument.
- **`externalReference`.** Many entities accept an external ID for idempotent integration.
- **Permissions & actors.** Writes are gated by `PermissionEnum`; the acting principal is a
  `User` or `App` (`union IssuingPrincipal`, `union UserOrApp`). See
  [Accounts & Permissions](/tech/saleor/Accounts%20%26%20Permissions.md).
- **Rich text.** Editorial content (`description`, page `content`) is `JSONString`
  (EditorJS blocks).
- **`@doc` directive.** Fields are grouped into named categories via `@doc(category:)`;
  `@webhookEventsInfo` annotates which webhook events a field triggers.

### Domains
Catalog: [Products & Variants](/tech/saleor/Products%20%26%20Variants.md) ·
[Attributes](/tech/saleor/Attributes.md) ·
[Categories & Collections](/tech/saleor/Categories%20%26%20Collections.md).
Selling flow: [Checkout](/tech/saleor/Checkout.md) ·
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md) ·
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md).
Organization: [Accounts & Permissions](/tech/saleor/Accounts%20%26%20Permissions.md) ·
[Channels](/tech/saleor/Channels.md).
Logistics: [Warehouses & Stock](/tech/saleor/Warehouses%20%26%20Stock.md) ·
[Shipping](/tech/saleor/Shipping.md) · [Taxes](/tech/saleor/Taxes.md).
Value: [Discounts](/tech/saleor/Discounts.md) · [Gift Cards](/tech/saleor/Gift%20Cards.md).
Platform: [Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md) ·
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md) ·
[Translations](/tech/saleor/Translations.md).

### Storefront relevance
The storefront-facing read/write surface is dominated by
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md),
[Categories & Collections](/tech/saleor/Categories%20%26%20Collections.md),
[Checkout](/tech/saleor/Checkout.md), [Accounts & Permissions](/tech/saleor/Accounts%20%26%20Permissions.md)
(auth + address book), [Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
(order history), and [Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md).
All of it is read through a `channel`.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[LLM Wiki](/sources/LLM%20Wiki.md)
[Competitor Landscape](/product/market/Competitor%20Landscape.md)
