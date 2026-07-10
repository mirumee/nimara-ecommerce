---
type: "Technical Reference"
title: "Accounts & Permissions"
description: "Saleor's people and access-control layer — users, addresses, staff, permission groups, and the authentication/token flows."
tags:
  - "saleor"
  - "graphql"
  - "accounts"
  - "auth"
  - "permissions"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

The people and access-control layer: customer and staff `User`s, their postal `Address`es,
permission `Group`s that bundle `Permission`s, and the authentication actors (users and
apps). Also covers session-token lifecycle and account self-service.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- `me: User` · `user(id, email, externalReference): User`
- `customers(…): UserCountableConnection` · `staffUsers(…): UserCountableConnection`
- `permissionGroups(…): GroupCountableConnection` · `permissionGroup(id): Group`
- `address(id): Address` · `addressValidationRules(countryCode, …): AddressValidationData`

### Key types
- **User** (`Node & ObjectWithMetadata`) — `email`, `firstName`, `lastName`, `isStaff`,
  `isActive`, `isConfirmed`, `addresses`, `defaultShippingAddress`, `defaultBillingAddress`,
  `userPermissions`, `permissionGroups`, `accessibleChannels`, `restrictedAccessToChannels`,
  `orders`, `giftCards`, `languageCode`.
- **Address** (`Node & ObjectWithMetadata`) — `firstName`, `lastName`, `companyName`,
  `streetAddress1/2`, `city`, `cityArea`, `postalCode`, `country: CountryDisplay`,
  `countryArea`, `phone`, `isDefaultShippingAddress`, `isDefaultBillingAddress`.
- **Group** (`Node`) — `name`, `users`, `permissions`, `userCanManage`, `accessibleChannels`,
  `restrictedAccessToChannels`.
- **Permission** — `code: PermissionEnum`, `name`.

### Mutations
- Auth / tokens: `tokenCreate`, `tokenRefresh`, `tokenVerify`, `externalAuthenticationUrl`,
  `externalObtainAccessTokens`.
- Account self-service: `accountRegister`, `accountUpdate`, `accountDelete`, `confirmAccount`,
  `requestPasswordReset`, `setPassword`, `passwordChange`, `accountAddressCreate`.
- Staff-managed: `customerCreate/Update`, `staffCreate/Update`.
- Permission groups: `permissionGroupCreate/Update/Delete`.
- Addresses: `addressCreate/Update/Delete`.

### Enums
- `PermissionEnum` — the ~23 staff permissions gating mutations (e.g. `MANAGE_PRODUCTS`,
  `MANAGE_ORDERS`, `MANAGE_CHECKOUTS`, `HANDLE_PAYMENTS`, `MANAGE_CHANNELS`,
  `MANAGE_DISCOUNTS`, `MANAGE_STAFF`, `MANAGE_SETTINGS`, `MANAGE_TRANSLATIONS`, …).
- `CountryCode` — full ISO country list (~250 values).
- `AddressTypeEnum`: `BILLING`, `SHIPPING`.
- `AppTypeEnum`: `LOCAL`, `THIRDPARTY`; `CustomerEventsEnum` — account lifecycle events.

### Unions / interfaces
- `union UserOrApp = User | App`; `union IssuingPrincipal = App | User` — identifies the
  actor behind an action.

### Storefront relevance
Auth uses the JWT flow: `tokenCreate` → `tokenRefresh`/`tokenVerify`; `me` reads the current
customer (profile, order history, address book, gift cards). Registration/password flows are
the `account*` mutations. Staff scoping via `accessibleChannels`/`restrictedAccessToChannels`
matters for multi-channel/marketplace setups.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Channels](/tech/saleor/Channels.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md)
