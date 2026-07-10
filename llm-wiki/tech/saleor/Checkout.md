---
type: "Technical Reference"
title: "Checkout"
description: "Saleor's cart/session — Checkout and CheckoutLine, the addresses/delivery/payment steps, and conversion into an order via checkoutComplete."
tags:
  - "saleor"
  - "graphql"
  - "checkout"
  - "cart"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

An in-progress shopping cart/session tied to a channel: lines, addresses, a chosen
delivery/payment method, and computed prices, eventually converted into an
[Order](/tech/saleor/Orders%20%26%20Fulfillment.md) via `checkoutComplete`. This is the most
storefront-critical write flow.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `checkout(id, token): Checkout` · `checkouts(…): CheckoutCountableConnection` ·
  `checkoutLines(…): CheckoutLineCountableConnection`

### Key types
- **Checkout** (`Node & ObjectWithMetadata`) — `token: UUID!`, `channel`, `email`, `user`,
  `lines`, `quantity`, `billingAddress`, `shippingAddress`, `shippingMethods`
  (+ deprecated `availableShippingMethods`), `availablePaymentGateways`,
  `availableCollectionPoints`, `delivery`/`deliveryMethod`, `totalPrice: TaxedMoney`,
  `subtotalPrice`, `shippingPrice`, `totalBalance`, `authorizeStatus`, `chargeStatus`,
  `transactions`, `giftCards`, `voucherCode`, `discount`, `isShippingRequired`,
  `languageCode`, `storedPaymentMethods`, `problems`.
- **CheckoutLine** (`Node & ObjectWithMetadata`) — `variant`, `quantity`, `unitPrice`,
  `undiscountedUnitPrice`, `totalPrice`, `requiresShipping`, `isGift`, `problems`.

### Mutations
- Lifecycle: `checkoutCreate`, `checkoutCreateFromOrder`, `checkoutComplete`, `checkoutDelete`.
- Lines: `checkoutLinesAdd`, `checkoutLinesUpdate`, `checkoutLinesDelete`, `checkoutLineDelete`.
- Addresses: `checkoutShippingAddressUpdate`, `checkoutBillingAddressUpdate`.
- Delivery: `checkoutDeliveryMethodUpdate` (+ deprecated `checkoutShippingMethodUpdate`).
- Contact: `checkoutCustomerAttach`, `checkoutCustomerDetach`, `checkoutEmailUpdate`,
  `checkoutCustomerNoteUpdate`, `checkoutLanguageCodeUpdate`.
- Payment: `checkoutPaymentCreate` (legacy) — modern flow uses the transaction API, see
  [Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md).
- Promo: `checkoutAddPromoCode`, `checkoutRemovePromoCode`.

### Enums / states
- `CheckoutAuthorizeStatusEnum`: `NONE`, `PARTIAL`, `FULL`.
- `CheckoutChargeStatusEnum`: `NONE`, `PARTIAL`, `FULL`, `OVERCHARGED`.

### Storefront relevance
The canonical flow: `checkoutCreate` (with `channel` + lines) → address updates → pick
delivery method from `shippingMethods` → collect payment (transaction API) → `checkoutComplete`
to produce an Order. `problems`/line `problems` surface blocking issues (e.g. out of stock)
before completion. Discount info on the checkout is flat (`discount`, `discountName`) — there
is no `CheckoutDiscount` type.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md)
[Shipping](/tech/saleor/Shipping.md)
[Discounts](/tech/saleor/Discounts.md)
