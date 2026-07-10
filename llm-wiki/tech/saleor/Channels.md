---
type: "Technical Reference"
title: "Channels"
description: "Saleor's multi-market / multi-currency axis — the Channel that scopes currency, country, and settings, and the channel-listing join types everything sellable hangs off."
tags:
  - "saleor"
  - "graphql"
  - "channels"
  - "multi-market"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

A `Channel` is Saleor's multi-market / multi-currency mechanism: it scopes currency, country,
and sales/operational settings, and is the axis along which per-market data (product/
collection publication, shipping prices, warehouse allocation, tax config) is configured.
Most sellable/priced entities are **not global** — they hang off a channel via
`*ChannelListing` join types, which is why storefront reads pass a `channel` argument.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `channel(id, slug): Channel` · `channels: [Channel!]`

### Key types
- **Channel** (`Node & ObjectWithMetadata`) — `slug`, `name`, `isActive`, `currencyCode`,
  `defaultCountry: CountryDisplay`, `countries`, `warehouses`, `hasOrders`,
  `stockSettings: StockSettings`, `orderSettings: OrderSettings`,
  `checkoutSettings: CheckoutSettings`, `paymentSettings: PaymentSettings`,
  `taxConfiguration`, `availableShippingMethodsPerCountry`.
- **StockSettings** — `allocationStrategy: AllocationStrategyEnum`.
- **OrderSettings** — `automaticallyConfirmAllNewOrders`, `expireOrdersAfter`,
  `markAsPaidStrategy: MarkAsPaidStrategyEnum`, `allowUnpaidOrders`, …
- **CheckoutSettings** — `automaticallyCompleteFullyPaidCheckouts`,
  `automaticCompletionDelay`, `useLegacyErrorFlow`, …
- **PaymentSettings** — `defaultTransactionFlowStrategy: TransactionFlowStrategyEnum`,
  `releaseFundsForExpiredCheckouts`, `checkoutTtlBeforeReleasingFunds`, …
- **Channel-listing join types** — `ProductChannelListing`, `ProductVariantChannelListing`,
  `CollectionChannelListing`, `ShippingMethodChannelListing`, `VoucherChannelListing`,
  `SaleChannelListing`: each pairs an entity with a `channel` plus per-channel price/publish
  fields.

### Mutations
- `channelCreate`, `channelUpdate`, `channelDelete`, `channelActivate`, `channelDeactivate`,
  `channelReorderWarehouses` (drives the `PRIORITIZE_SORTING_ORDER` allocation strategy).

### Enums
- `AllocationStrategyEnum`: `PRIORITIZE_SORTING_ORDER`, `PRIORITIZE_HIGH_STOCK`.
- `MarkAsPaidStrategyEnum`: `TRANSACTION_FLOW`, `PAYMENT_FLOW`.
- `TransactionFlowStrategyEnum`: `AUTHORIZATION`, `CHARGE`.

### Storefront relevance
A storefront instance is generally bound to one channel (currency + country + settings).
Pass `channel` on catalog/checkout reads; a product/collection absent in a channel simply
isn't published there. Channels are the natural boundary for multi-market and marketplace
setups — see [Competitor Landscape](/product/market/Competitor%20Landscape.md) on Saleor's
multi-channel strength.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Warehouses & Stock](/tech/saleor/Warehouses%20%26%20Stock.md)
[Taxes](/tech/saleor/Taxes.md)
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md)
