---
type: "Saleor Schema Note"
title: "Orders & Fulfillment"
description: "Saleor Order type, status/charge enums, fulfillments, and payment status."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "orders"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

An `Order` is the immutable-ish record produced when `checkoutComplete` succeeds. It carries
line items, addresses, money totals, payment/transaction state, and fulfillments.

**Key types**

- `Order` (`Node & ObjectWithMetadata`) — `id`, `number`, `created`, `status` (`OrderStatus`),
  `lines` (`OrderLine[]`), `channel`, `user`/`userEmail`, `shippingAddress`/`billingAddress`,
  `deliveryMethod`, `discounts` (`OrderDiscount[]`), `voucher`, `subtotal`/`total`
  (`TaxedMoney`), `fulfillments` (`Fulfillment[]`), `payments` (`Payment[]`), `transactions`
  (`TransactionItem[]`), `isPaid`, `paymentStatus` (`PaymentChargeStatusEnum`),
  `authorizeStatus` (`OrderAuthorizeStatusEnum`), `chargeStatus` (`OrderChargeStatusEnum`).
- `Fulfillment` — a shipment of `FulfillmentLine[]` with a `status` and tracking number.
- `OrderLine` — ordered variant snapshot: quantity, unit/total price, and fulfillment split.

**Enums (this schema version)**

- `OrderStatus`: `DRAFT`, `UNCONFIRMED`, `UNFULFILLED`, `PARTIALLY_FULFILLED`, `FULFILLED`,
  `PARTIALLY_RETURNED`, `RETURNED`, `CANCELED`, `EXPIRED`.
- `PaymentChargeStatusEnum` summarizes charge state; `authorizeStatus`/`chargeStatus` mirror
  the Transactions API view (`NONE` / `PARTIAL` / `FULL`) used on `Checkout`.

**Nimara usage**

Order reads and fulfillment live in `packages/infrastructure/src/fulfillment/saleor/` and
user order history in `user/saleor/`. In the marketplace app, the `order-paid` Saleor webhook
feeds the Postgres ledger (`apps/marketplace/src/lib/ledger/`).

## Related Notes

[Saleor Schema (MOC)](Saleor%20Schema%20%28MOC%29.md)
[Checkout & Payments](Checkout%20%26%20Payments.md)
[Account & Auth](Account%20%26%20Auth.md)
