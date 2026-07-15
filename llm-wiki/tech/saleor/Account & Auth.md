---
type: "Saleor Schema Note"
title: "Account & Auth"
description: "Saleor User and Address types plus the JWT token mutations used for authentication."
tags:
  - "saleor"
  - "graphql"
  - "schema"
  - "auth"
  - "account"
saleor_schema_hash: "496fcbeb16ea"
saleor_schema_generated: "2026-07-14T00:00:00+00:00"
created: "2026-07-14T00:00:00+00:00"
timestamp: "2026-07-14T00:00:00+00:00"
---

## Content

Saleor authenticates with **JWT**. Nimara obtains a token pair, sends the access token as a
bearer header on GraphQL requests, and refreshes it as needed.

**Key mutations**

- `tokenCreate(email, password)` → `token`, `refreshToken`, `csrfToken`, `user`, `errors`.
- `tokenRefresh(refreshToken)` → new `token`.
- `tokenVerify(token)` → validity + `user`.
- Account lifecycle: `accountRegister`, `confirmAccount`, `requestPasswordReset`,
  `setPassword`, `accountUpdate`, `accountAddressCreate/Update/Delete`.

**Key types**

- `User` (`Node & ObjectWithMetadata`) — `id`, `email`, `firstName`/`lastName`, `isActive`,
  `addresses` (`Address[]`), `defaultShippingAddress`/`defaultBillingAddress`, `orders`,
  `checkouts`, and metadata.
- `Address` (`Node & ObjectWithMetadata`) — `firstName`, `lastName`, `streetAddress1/2`,
  `city`, `postalCode`, `country` (`CountryDisplay`, `CountryCode` enum), `phone`,
  `isDefaultShippingAddress`/`isDefaultBillingAddress`.

The current authenticated user is read via the `me` query.

**Nimara usage**

Storefront auth wraps these in `packages/infrastructure/src/{auth,user,address}/saleor/`,
surfaced through `getUserService()` and `getAccessToken()` in Server Actions. Address
validation/formatting is channel/country-aware (`shop.countries`). The marketplace app has its
own JWT layer (`apps/marketplace/src/lib/auth/`) for vendors.

## Related Notes

[Saleor Schema (MOC)](./Saleor%20Schema%20%28MOC%29.md)
[Shop, Channels & Warehouses](./Shop%2C%20Channels%20%26%20Warehouses.md)
[Orders & Fulfillment](./Orders%20%26%20Fulfillment.md)
