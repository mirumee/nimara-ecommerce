---
type: "Technical Reference"
title: "Payments & Transactions"
description: "Saleor's two payment generations — the legacy plugin Payment/Transaction flow and the modern app-driven TransactionItem/TransactionEvent API."
tags:
  - "saleor"
  - "graphql"
  - "payments"
  - "transactions"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Two coexisting models. The **legacy** plugin-based flow uses `Payment`/`Transaction` and
`PaymentGateway`. The **modern**, app-driven flow uses `TransactionItem`/`TransactionEvent`
to track authorize/charge/refund/cancel money movements against orders and checkouts. New
integrations use the transaction API; it is central to Nimara's Stripe Connect work.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `payment(id): Payment` · `payments(…): PaymentCountableConnection`
- `transaction(id): TransactionItem` · `transactions(…): TransactionCountableConnection`

### Key types
- **TransactionItem** (`Node & ObjectWithMetadata`) — modern: `token: UUID!`, `name`,
  `message`, `pspReference`, `actions: [TransactionActionEnum!]`, `authorizedAmount`,
  `chargedAmount`, `refundedAmount`, `canceledAmount`, the matching `*PendingAmount` fields,
  `order`, `checkout`, `events`, `createdBy: UserOrApp`, `externalUrl`, `paymentMethodDetails`.
- **TransactionEvent** (`Node`) — `createdAt`, `pspReference`, `message`, `amount`,
  `type: TransactionEventTypeEnum`, `createdBy: UserOrApp`, `idempotencyKey`.
- **Payment** (`Node & ObjectWithMetadata`) — legacy: `gateway`, `token`, `checkout`, `order`,
  `chargeStatus: PaymentChargeStatusEnum`, `total`, `capturedAmount`,
  `availableCaptureAmount`, `availableRefundAmount`, `actions`, `transactions`, `creditCard`.
- **Transaction** (`Node`) — legacy sub-record: `kind: TransactionKind`, `isSuccess`, `amount`.
- **PaymentGateway** — `name`, `config: [GatewayConfigLine!]`, `currencies`.

### Mutations
- Modern: `transactionCreate`, `transactionUpdate`, `transactionEventReport`,
  `transactionInitialize`, `transactionProcess`, `transactionRequestAction`,
  `transactionRequestRefundForGrantedRefund`.
- Legacy: `paymentCapture`, `paymentRefund`, `paymentVoid`, `paymentInitialize`,
  `paymentCheckBalance`, `paymentGatewayInitialize`.
- Stored methods / tokenization: `paymentGatewayInitializeTokenization`,
  `paymentMethodInitializeTokenization`, `paymentMethodProcessTokenization`.

### Enums / states
- `TransactionActionEnum`: `CHARGE`, `REFUND`, `CANCEL`.
- `TransactionEventTypeEnum`: authorization / charge / refund / cancel × `SUCCESS`/`FAILURE`/
  `REQUEST`/`ACTION_REQUIRED` variants, plus `CHARGE_BACK`, `REFUND_REVERSE`, `INFO`.
- `PaymentChargeStatusEnum`: `NOT_CHARGED`, `PENDING`, `PARTIALLY_CHARGED`, `FULLY_CHARGED`,
  `PARTIALLY_REFUNDED`, `FULLY_REFUNDED`, `REFUSED`, `CANCELLED`.
- `TransactionFlowStrategyEnum`: `AUTHORIZATION`, `CHARGE` (channel default set in
  [Channels](/tech/saleor/Channels.md) `paymentSettings`).
- `TransactionKind` (legacy): `AUTH`, `CAPTURE`, `REFUND`, `VOID`, `CONFIRM`, …

### Unions / interfaces
- `union UserOrApp = User | App` — who created a transaction/event.
- `interface PaymentMethodDetails` — payment-method metadata on `TransactionItem`.

### Storefront relevance
Sync webhooks (`TRANSACTION_INITIALIZE_SESSION`, `TRANSACTION_PROCESS_SESSION`,
`TRANSACTION_CHARGE_REQUESTED`, …) drive the app-based payment flow — see
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md).
The checkout collects payment via this API before `checkoutComplete`.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Checkout](/tech/saleor/Checkout.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
[Channels](/tech/saleor/Channels.md)
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md)
