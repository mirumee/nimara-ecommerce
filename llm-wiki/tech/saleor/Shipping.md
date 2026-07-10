---
type: "Technical Reference"
title: "Shipping"
description: "Saleor shipping — zones, price/weight-based methods, per-channel pricing, and postal-code inclusion/exclusion rules."
tags:
  - "saleor"
  - "graphql"
  - "shipping"
  - "delivery"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

How orders reach customers: `ShippingZone`s group countries/warehouses; `ShippingMethodType`
defines a method (by price or weight) with per-channel pricing (`ShippingMethodChannelListing`)
and postal-code rules (`ShippingMethodPostalCodeRule`). The customer/order-facing view of an
available method is `ShippingMethod`.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `shippingZone(id, channel): ShippingZone` ·
  `shippingZones(filter, channel, …): ShippingZoneCountableConnection`

### Key types
- **ShippingZone** (`Node & ObjectWithMetadata`) — `name`, `default`, `priceRange`,
  `countries`, `shippingMethods: [ShippingMethodType!]`, `warehouses`, `channels`.
- **ShippingMethodType** (`Node & ObjectWithMetadata`) — admin/config side: `name`,
  `description`, `type: ShippingMethodTypeEnum`, `channelListings`,
  `minimum/maximumOrderPrice`, `minimum/maximumOrderWeight`, `postalCodeRules`,
  `excludedProducts`, `minimum/maximumDeliveryDays`, `taxClass`.
- **ShippingMethod** (`Node & ObjectWithMetadata`) — customer side: `name`, `description`,
  `price: Money!`, `active`, `message`, `minimum/maximumDeliveryDays`.
- **ShippingMethodChannelListing** (`Node`) — `channel`, `price`, `minimum/maximumOrderPrice`.
- **ShippingMethodPostalCodeRule** (`Node`) — `start`, `end`,
  `inclusionType: PostalCodeRuleInclusionTypeEnum`.

### Mutations
- Zones: `shippingZoneCreate/Update/Delete/BulkDelete`.
- Prices/methods: `shippingPriceCreate/Update/Delete/BulkDelete`,
  `shippingPriceExcludeProducts`, `shippingPriceRemoveProductFromExclude`.
- Channel pricing: `shippingMethodChannelListingUpdate`.

### Enums
- `ShippingMethodTypeEnum`: `PRICE`, `WEIGHT`.
- `PostalCodeRuleInclusionTypeEnum`: `INCLUDE`, `EXCLUDE`.

### Storefront relevance
At checkout, `Checkout.shippingMethods` returns the methods available for the cart/address;
the storefront lets the customer pick one via `checkoutDeliveryMethodUpdate`. App-provided
methods and filtering come through sync webhooks
(`SHIPPING_LIST_METHODS_FOR_CHECKOUT`, `CHECKOUT_FILTER_SHIPPING_METHODS`) — see
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md).

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Checkout](/tech/saleor/Checkout.md)
[Warehouses & Stock](/tech/saleor/Warehouses%20%26%20Stock.md)
[Channels](/tech/saleor/Channels.md)
[Taxes](/tech/saleor/Taxes.md)
