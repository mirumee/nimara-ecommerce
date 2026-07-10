---
type: "Technical Reference"
title: "Orders & Fulfillment"
description: "Saleor orders and draft orders, their lines, and the fulfillment/invoice subsystems that track shipment and payment state."
tags:
  - "saleor"
  - "graphql"
  - "orders"
  - "fulfillment"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Placed and draft orders and their line items, plus the shipment (`Fulfillment`/
`FulfillmentLine`) and billing-document (`Invoice`) subsystems that track fulfillment and
payment state. An order is created from a completed [Checkout](/tech/saleor/Checkout.md) or
built as a draft in the dashboard.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `order(id): Order` · `orders(…): OrderCountableConnection` ·
  `draftOrders(…): OrderCountableConnection`
- `ordersTotal(…): TaxedMoney` (deprecated) · `orderByToken(token): Order` (deprecated)

### Key types
- **Order** (`Node & ObjectWithMetadata`) — `number`, `status: OrderStatus`, `statusDisplay`,
  `channel`, `user`, `userEmail`, `origin: OrderOriginEnum`, `lines`, `fulfillments`,
  `invoices`, `billingAddress`, `shippingAddress`, `deliveryMethod`, `total: TaxedMoney`,
  `subtotal`, `undiscountedTotal`, `shippingPrice`, `isPaid`,
  `paymentStatus`/`authorizeStatus`/`chargeStatus`, `transactions`, `payments`,
  `totalAuthorized`/`totalCharged`/`totalCanceled`/`totalRefunded`/`totalBalance`,
  `events`, `grantedRefunds`, `voucherCode`, `discounts`, `canFinalize`.
- **OrderLine** (`Node & ObjectWithMetadata`) — `productName`, `variantName`, `productSku`,
  `quantity`, `quantityFulfilled`, `quantityToFulfill`, `unitPrice`, `totalPrice`,
  `unitDiscount`, `taxRate`, `variant`, `allocations`, `isGift`.
- **Fulfillment** (`Node & ObjectWithMetadata`) — `fulfillmentOrder`, `status: FulfillmentStatus`,
  `trackingNumber`, `lines`, `warehouse`, `totalRefundedAmount`.
- **FulfillmentLine** (`Node`) — `quantity`, `orderLine`.
- **Invoice** (`Job & Node & ObjectWithMetadata`) — `status: JobStatusEnum`, `number`, `url`,
  `order`.

### Mutations
- Lifecycle: `orderCreateFromCheckout`, `orderConfirm`, `orderCancel`, `orderBulkCancel`,
  `orderBulkCreate`, `orderUpdate`, `orderUpdateShipping`, `orderMarkAsPaid`.
- Payment ops: `orderCapture`, `orderRefund`, `orderVoid`, `orderGrantRefundCreate/Update`.
- Lines / notes / discounts: `orderLinesCreate`, `orderLineUpdate`, `orderLineDelete`,
  `orderLineDiscountUpdate/Remove`, `orderDiscountAdd/Update/Delete`, `orderNoteAdd/Update`,
  `orderSettingsUpdate`.
- Draft orders: `draftOrderCreate/Update/Delete/BulkDelete`, `draftOrderComplete`,
  `draftOrderLinesBulkDelete`.
- Fulfillment: `orderFulfill`, `orderFulfillmentApprove/Cancel`,
  `orderFulfillmentRefundProducts`, `orderFulfillmentReturnProducts`,
  `orderFulfillmentUpdateTracking`.
- Invoices: `invoiceCreate`, `invoiceRequest/RequestDelete`, `invoiceUpdate`, `invoiceDelete`,
  `invoiceSendNotification`.

### Enums / states
- `OrderStatus`: `DRAFT`, `UNCONFIRMED`, `UNFULFILLED`, `PARTIALLY_FULFILLED`,
  `PARTIALLY_RETURNED`, `RETURNED`, `FULFILLED`, `CANCELED`, `EXPIRED`.
- `OrderAuthorizeStatusEnum`: `NONE`, `PARTIAL`, `FULL`.
- `OrderChargeStatusEnum`: `NONE`, `PARTIAL`, `FULL`, `OVERCHARGED`.
- `FulfillmentStatus`: `FULFILLED`, `REFUNDED`, `RETURNED`, `REPLACED`,
  `REFUNDED_AND_RETURNED`, `CANCELED`, `WAITING_FOR_APPROVAL`.
- `OrderOriginEnum`: `CHECKOUT`, `DRAFT`, `REISSUE`, `BULK_CREATE`.
- `OrderEventsEnum` — rich audit trail (e.g. `PLACED`, `CONFIRMED`, `ORDER_FULLY_PAID`,
  `PAYMENT_CAPTURED`, `FULFILLMENT_FULFILLED_ITEMS`, `INVOICE_GENERATED`, `NOTE_ADDED`).

### Storefront relevance
Order history and detail pages read `me { orders }` or `order(id)` (avoid the deprecated
`orderByToken`). Money movement is tracked both as summary fields (`totalCharged`,
`totalRefunded`) and via the transaction API in
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md).

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Checkout](/tech/saleor/Checkout.md)
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md)
[Warehouses & Stock](/tech/saleor/Warehouses%20%26%20Stock.md)
[Discounts](/tech/saleor/Discounts.md)
