---
type: "Technical Reference"
title: "Gift Cards"
description: "Saleor prepaid store-credit — GiftCard balances, audit events, tags, and shop-wide expiry settings."
tags:
  - "saleor"
  - "graphql"
  - "gift-cards"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

Prepaid, code-based store-credit instruments with a monetary balance spendable on orders,
plus their audit history (`GiftCardEvent`), categorization (`GiftCardTag`), and shop-wide
expiry configuration (`GiftCardSettings`). A gift-card product is a `ProductType` of kind
`GIFT_CARD`.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `giftCard(id): GiftCard` · `giftCards(filter, sortBy, search, …): GiftCardCountableConnection`
- `giftCardCurrencies: [String!]!` · `giftCardTags(filter, …): GiftCardTagCountableConnection`
- `giftCardSettings: GiftCardSettings!`

### Key types
- **GiftCard** (`Node & ObjectWithMetadata`) — `displayCode`, `last4CodeChars`,
  `code` (permission-gated), `created`, `createdBy`, `lastUsedOn`, `expiryDate`, `isActive`,
  `initialBalance: Money`, `currentBalance: Money`, `product`, `app`, `boughtInChannel`,
  `events`, `tags`.
- **GiftCardEvent** (`Node`) — `date`, `type: GiftCardEventsEnum`, `user`, `app`, `message`,
  `email`, `orderId`, `orderNumber`, `tags`, `balance: GiftCardEventBalance`, `expiryDate`.
- **GiftCardTag** (`Node`) — `name`.
- **GiftCardSettings** — `expiryType: GiftCardSettingsExpiryTypeEnum`, `expiryPeriod: TimePeriod`.

### Mutations
- Lifecycle: `giftCardCreate/Update/Delete`, `giftCardActivate/Deactivate`, `giftCardResend`,
  `giftCardAddNote`.
- Bulk: `giftCardBulkCreate/BulkDelete/BulkActivate/BulkDeactivate`.
- Settings: `giftCardSettingsUpdate`.

### Enums
- `GiftCardEventsEnum`: `ISSUED`, `BOUGHT`, `UPDATED`, `ACTIVATED`, `DEACTIVATED`,
  `BALANCE_RESET`, `EXPIRY_DATE_UPDATED`, `TAGS_UPDATED`, `SENT_TO_CUSTOMER`, `RESENT`,
  `NOTE_ADDED`, `USED_IN_ORDER`, `REFUNDED_IN_ORDER`.
- `GiftCardSettingsExpiryTypeEnum`: `NEVER_EXPIRE`, `EXPIRY_PERIOD`.

### Storefront relevance
Applied to a cart as a promo code (`checkoutAddPromoCode`); a checkout exposes applied cards
via `Checkout.giftCards`. Customers see their cards via `me { giftCards }`.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Checkout](/tech/saleor/Checkout.md)
[Discounts](/tech/saleor/Discounts.md)
[Products & Variants](/tech/saleor/Products%20%26%20Variants.md)
