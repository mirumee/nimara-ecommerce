---
type: "Technical Reference"
title: "Products & Variants"
description: "Saleor's sellable catalog — Product, ProductVariant, ProductType, media, and per-channel pricing/publication."
tags:
  - "saleor"
  - "graphql"
  - "catalog"
  - "products"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

The sellable catalog. A `Product` (belonging to a `ProductType` and a `Category`) groups one
or more `ProductVariant`s — the actually-purchasable SKUs. Publication, availability, and
price are **per-channel** via `ProductChannelListing` / `ProductVariantChannelListing`; media
via `ProductMedia`; display pricing via `ProductPricingInfo` / `VariantPricingInfo`.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `product(id, slug, externalReference, channel): Product`
- `products(filter, where, sortBy, search, channel, …): ProductCountableConnection`
- `productVariant(id, sku, externalReference, channel): ProductVariant`
- `productVariants(ids, channel, filter, where, sortBy, …): ProductVariantCountableConnection`
- `productType(id, slug): ProductType` · `productTypes(…): ProductTypeCountableConnection`

### Key types
- **Product** (`Node & ObjectWithMetadata & ObjectWithAttributes`) — `name`, `slug`,
  `description: JSONString`, `productType`, `category`, `defaultVariant`,
  `pricing(address): ProductPricingInfo`, `isAvailable(address)`, `rating`, `channelListings`,
  `collections`, `productVariants`, `media`, `assignedAttributes`, `thumbnail`, `taxClass`.
- **ProductVariant** (`Node & ObjectWithMetadata & ObjectWithAttributes`) — `name`, `sku`,
  `product`, `pricing(address): VariantPricingInfo`, `channelListings`, `trackInventory`,
  `quantityLimitPerCustomer`, `quantityAvailable`, `stocks`, `preorder`, `attributes`.
- **ProductType** (`Node & ObjectWithMetadata`) — `name`, `slug`, `kind: ProductTypeKindEnum`,
  `isShippingRequired`, `productAttributes`, `assignedVariantAttributes`, `taxClass`.
- **ProductMedia** — `sortOrder`, `alt`, `type: ProductMediaType`, `oembedData`, `url(size, format)`.
- **ProductChannelListing** — `channel`, `isPublished`, `publishedAt`, `visibleInListings`,
  `availableForPurchaseAt`, `isAvailableForPurchase`, `discountedPrice`, `pricing(address)`.
- **ProductVariantChannelListing** — `channel`, `price`, `costPrice`, `priorPrice`, `preorderThreshold`.
- **ProductPricingInfo / VariantPricingInfo** — `onSale`, `discount`, `priceRange` /
  `price`, all in `TaxedMoney` (net/gross/tax).

### Mutations
- Product: `productCreate/Update/Delete`, `productBulkCreate/BulkDelete`,
  `productChannelListingUpdate`, `productReorderAttributeValues`, `productTranslate`.
- Variant: `productVariantCreate/Update/Delete`, `productVariantBulkCreate/BulkUpdate/BulkDelete`,
  `productVariantChannelListingUpdate`, `productVariantStocksCreate/Update/Delete`,
  `productVariantSetDefault`, `productVariantReorder`.
- Media: `productMediaCreate/Update/Delete/BulkDelete/Reorder`.
- ProductType: `productTypeCreate/Update/Delete/BulkDelete`, `productTypeReorderAttributes`.

### Enums
- `ProductTypeKindEnum`: `NORMAL`, `GIFT_CARD`.
- `ProductMediaType`: `IMAGE`, `VIDEO`.
- `VariantAttributeScope`: `ALL`, `VARIANT_SELECTION`, `NOT_VARIANT_SELECTION`.
- `StockAvailability`: `IN_STOCK`, `OUT_OF_STOCK` (product filter).

### Storefront relevance
Core read surface: PLP/PDP render from `products`/`product` with a `channel`, reading
`pricing`, `media`, `assignedAttributes`, and availability. Note many older list fields
(`Product.variants`, `Product.attributes`, `ProductType.variantAttributes`) are **deprecated**
in favor of `productVariants` / `assignedAttributes` / `assignedVariantAttributes`.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Attributes](/tech/saleor/Attributes.md)
[Categories & Collections](/tech/saleor/Categories%20%26%20Collections.md)
[Channels](/tech/saleor/Channels.md)
[Warehouses & Stock](/tech/saleor/Warehouses%20%26%20Stock.md)
