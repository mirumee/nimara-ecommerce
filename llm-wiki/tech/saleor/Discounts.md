---
type: "Technical Reference"
title: "Discounts"
description: "Saleor promotional pricing — code-based Vouchers, the legacy Sale model, and the newer Promotion/PromotionRule catalogue and order-promotion model."
tags:
  - "saleor"
  - "graphql"
  - "discounts"
  - "promotions"
  - "vouchers"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Promotional price reductions. Two generations coexist: the **legacy** `Sale`/
`SaleChannelListing` catalogue-discount model (deprecated) and the **newer**
`Promotion`/`PromotionRule` model supporting both catalogue- and order-level promotions.
`Voucher` models code-based discounts applied at checkout; `OrderDiscount` is a discount
recorded on an order.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `voucher(id): Voucher` · `vouchers(filter, sortBy, search, channel, …): VoucherCountableConnection`
- `sale(id): Sale` *(deprecated → `promotion`)* · `sales(…): SaleCountableConnection` *(deprecated → `promotions`)*
- `promotion(id): Promotion` · `promotions(where, sortBy, …): PromotionCountableConnection`

### Key types
- **Voucher** (`Node & ObjectWithMetadata`) — `name`, `code` + `codes`, `usageLimit`, `used`,
  `startDate`, `endDate`, `applyOncePerOrder`, `applyOncePerCustomer`, `singleUse`,
  `onlyForStaff`, `discountValueType: DiscountValueTypeEnum`, `discountValue`, `minSpent`,
  `type: VoucherTypeEnum`, `channelListings`, plus category/collection/product/variant scopes.
- **VoucherChannelListing** (`Node`) — `channel`, `discountValue`, `currency`, `minSpent`.
- **Sale** (legacy, `Node & ObjectWithMetadata`) — `name`, `type: SaleType`, `startDate`,
  `endDate`, `discountValue`, `channelListings` (all superseded by `Promotion`).
- **Promotion** (`Node & ObjectWithMetadata`) — `name`, `type: PromotionTypeEnum`,
  `description: JSON`, `startDate`, `endDate`, `rules: [PromotionRule!]`, `events`, `translation`.
- **PromotionRule** (`Node`) — `name`, `promotion`, `channels`, `rewardValue`,
  `rewardValueType: RewardValueTypeEnum`, `rewardType: RewardTypeEnum`,
  `predicateType: PromotionTypeEnum`, `cataloguePredicate: JSON`, `orderPredicate: JSON`,
  `giftIds`, `giftsLimit`.
- **OrderDiscount** (`Node`) — `type: OrderDiscountType`, `name`,
  `valueType: DiscountValueTypeEnum`, `value`, `reason`, `total`.

### Mutations
- Voucher: `voucherCreate/Update/Delete/BulkDelete`, `voucherCataloguesAdd/Remove`,
  `voucherChannelListingUpdate`, `voucherCodeBulkDelete`, `voucherTranslate`.
- Sale (legacy): `saleCreate/Update/Delete/BulkDelete`, `saleCataloguesAdd/Remove`,
  `saleChannelListingUpdate`, `saleTranslate`.
- Promotion: `promotionCreate/Update/Delete/BulkDelete`, `promotionTranslate`.
- Promotion rule: `promotionRuleCreate/Update/Delete/Translate`.
- Order discount: `orderDiscountAdd/Update/Delete`, `orderLineDiscountUpdate/Remove`.

### Enums
- `DiscountValueTypeEnum`: `FIXED`, `PERCENTAGE`.
- `VoucherTypeEnum`: `SHIPPING`, `ENTIRE_ORDER`, `SPECIFIC_PRODUCT`.
- `VoucherDiscountType`: `FIXED`, `PERCENTAGE`, `SHIPPING`.
- `SaleType`: `FIXED`, `PERCENTAGE`.
- `PromotionTypeEnum`: `CATALOGUE`, `ORDER`.
- `RewardValueTypeEnum`: `FIXED`, `PERCENTAGE`.
- `RewardTypeEnum`: `SUBTOTAL_DISCOUNT`, `GIFT`.
- `OrderDiscountType`: `SALE`, `VOUCHER`, `MANUAL`, `PROMOTION`, `ORDER_PROMOTION`.

### Unions / interfaces
- `union PromotionEvent` = the promotion/rule lifecycle event types (created/updated/started/
  ended/deleted), via `PromotionEventInterface` / `PromotionRuleEventInterface`.

### Storefront relevance
Vouchers are applied to a cart with `checkoutAddPromoCode` / `checkoutRemovePromoCode`;
catalogue promotions surface as `onSale`/`discount` in `ProductPricingInfo`. Build new work
against `Promotion`/`PromotionRule`, not the deprecated `Sale`. There is no `CheckoutDiscount`
type — checkout discount data is flat (`Checkout.discount`, `discountName`).

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Checkout](/tech/saleor/Checkout.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
[Gift Cards](/tech/saleor/Gift%20Cards.md)
