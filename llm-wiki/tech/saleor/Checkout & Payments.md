---
type: "Saleor Schema Note"
title: "Checkout & Payments"
description: "Saleor Checkout type, lines, delivery, payment gateways, and the Transactions API."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "checkout"
  - "payments"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

`Checkout` is the mutable pre-order object. It is identified by a `token` (`UUID`) rather than
a global `id`, and is bound to one `Channel`. Checkout is built up through mutations
(`checkoutCreate`, `checkoutLinesAdd/Update/Delete`, `checkoutShippingAddressUpdate`,
`checkoutDeliveryMethodUpdate`, `checkoutEmailUpdate`) and finalized with `checkoutComplete`,
which produces an `Order`.

**Key types**

- `Checkout` (`Node & ObjectWithMetadata`) — `id`, `token`, `channel`, `email`, `user`,
  `lines` (`CheckoutLine[]`), `quantity`, `isShippingRequired`, `shippingAddress`/
  `billingAddress`, `shippingMethods` + `deliveryMethod`, `availablePaymentGateways`,
  `discount`/`voucherCode`, `subtotalPrice`/`shippingPrice`/`totalPrice` (all `TaxedMoney`),
  `authorizeStatus` (`CheckoutAuthorizeStatusEnum`), `chargeStatus` (`CheckoutChargeStatusEnum`),
  and `transactions` (`TransactionItem[]`).
- `CheckoutLine` — a variant plus `quantity` and line pricing.
- `PaymentGateway` — an entry in `availablePaymentGateways`: `id`, `name`, `currencies`,
  `config`. Nimara resolves gateways per channel (e.g. the Stripe app / marketplace Connect).

**Payments — two models.** Saleor exposes the legacy `Payment` object and the newer
**Transactions API** (`TransactionItem`, created/updated via `transactionInitialize`,
`transactionProcess`, and app webhooks). `Checkout.authorizeStatus`/`chargeStatus` summarize
transaction state (`NONE` / `PARTIAL` / `FULL`). Prefer transactions for new work; see
[Orders & Fulfillment](./Orders%20%26%20Fulfillment.md) for the post-completion view.

**Nimara usage**

Cart/checkout flows live in `packages/infrastructure/src/{cart,checkout}/saleor/` and payment
wiring in `payment/saleor/`. The marketplace app extends this with Stripe Connect; the
`apps/stripe` app is the Saleor payment gateway.

## Related Notes

[Saleor Schema (MOC)](./Saleor%20Schema%20%28MOC%29.md)
[Orders & Fulfillment](./Orders%20%26%20Fulfillment.md)
[Account & Auth](./Account%20%26%20Auth.md)
