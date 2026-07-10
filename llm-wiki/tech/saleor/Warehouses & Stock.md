---
type: "Technical Reference"
title: "Warehouses & Stock"
description: "Saleor inventory — warehouse locations, per-variant stock, allocation to orders, click-and-collect, and allocation strategy."
tags:
  - "saleor"
  - "graphql"
  - "inventory"
  - "warehouses"
  - "stock"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Physical/logical `Warehouse` locations, the `Stock` of each variant per warehouse, and the
`Allocation` of that stock to orders. Also governs click-and-collect options and how stock is
allocated across warehouses (set per channel — see [Channels](/tech/saleor/Channels.md)).
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `warehouse(id, externalReference): Warehouse` · `warehouses(filter, sortBy, …): WarehouseCountableConnection`
- `stock(id): Stock` · `stocks(filter, …): StockCountableConnection`

### Key types
- **Warehouse** (`Node & ObjectWithMetadata`) — `name`, `slug`, `email`, `isPrivate`,
  `address: Address`, `clickAndCollectOption: WarehouseClickAndCollectOptionEnum`,
  `shippingZones`, `stocks`, `externalReference`.
- **Stock** (`Node`) — `warehouse`, `productVariant`, `quantity` (total incl. allocated),
  `quantityAllocated`, `quantityReserved`.
- **Allocation** (`Node`) — `quantity`, `warehouse`.
- **StockSettings** (on channel) — `allocationStrategy: AllocationStrategyEnum`.

### Mutations
- Warehouse: `createWarehouse`, `updateWarehouse`, `deleteWarehouse`.
- Warehouse ↔ shipping zone: `assignWarehouseShippingZone`, `unassignWarehouseShippingZone`.
- Variant stock: `productVariantStocksCreate`, `productVariantStocksUpdate`,
  `productVariantStocksDelete`.

### Enums
- `WarehouseClickAndCollectOptionEnum`: `DISABLED`, `LOCAL`, `ALL`.
- `AllocationStrategyEnum`: `PRIORITIZE_SORTING_ORDER`, `PRIORITIZE_HIGH_STOCK`.
- `StockAvailability`: `IN_STOCK`, `OUT_OF_STOCK` (product filter input).

### Storefront relevance
Availability shown on PDP/PLP derives from stock: `ProductVariant.quantityAvailable`,
`isAvailable`, and (when `trackInventory` is on) allocations. Click-and-collect exposes
`Checkout.availableCollectionPoints` — warehouses reachable as pickup points.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Shipping](/tech/saleor/Shipping.md)
[Channels](/tech/saleor/Channels.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
