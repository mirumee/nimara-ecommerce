---
type: "Product Overview"
title: "Nimara Product Overview"
description: "A code-grounded map of Nimara's storefront, marketplace, payments, agent commerce, and supporting integration boundaries."
tags:
  - "product"
  - "overview"
  - "storefront"
  - "marketplace"
  - "payments"
  - "agent-commerce"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

# Nimara Product Overview

Nimara is a composable commerce monorepo whose runtime product consists of three cooperating web
applications: a customer storefront, a vendor marketplace, and a Stripe payment application. The
storefront delivers catalog discovery, customer accounts, cart, checkout, and order confirmation.
The marketplace gives authenticated vendors and operators commerce-management and settlement
surfaces. The payment application connects checkout transactions to Stripe through the commerce
backend's application and webhook contracts. The storefront also exposes negotiated commerce APIs
for agents and external platforms.

This page describes behavior present at commit
[`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005).
Individual capability, flow, and integration records provide the narrower contracts and their first
release evidence.

## Actors and product surfaces

| Actor                                 | Surface                                          | Shipped responsibilities                                                                                                                 |
| ------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Shopper or customer                   | Storefront                                       | Browse and search a localized catalog, manage a cart and account, complete checkout, and review an order confirmation.                   |
| Vendor                                | Marketplace                                      | Authenticate, manage assigned catalog and operational data, inspect orders, and establish a connected payment account.                   |
| Marketplace operator                  | Marketplace and its operational endpoints        | Configure the marketplace, oversee vendors, inspect payable funds, close payout batches, and execute connected-account transfers.        |
| Store operator                        | Storefront and payment application configuration | Select providers, connect the commerce backend, configure checkout payments, and register the payment application.                       |
| Agent client                          | Storefront commerce API                          | Negotiate supported protocol capabilities, search and look up catalog data, manage carts and checkout sessions, and retrieve orders.     |
| External commerce and payment systems | GraphQL, application, and webhook boundaries     | Supply catalog and order state, initiate payment lifecycle requests, report settlement state, and receive payment or transfer mutations. |

The immutable code snapshot exposes the
[storefront routes](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app),
[marketplace routes](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app),
and
[payment-application routes](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app)
described here.

## Capability map

- [Swappable Storefront Search and Content Providers](../capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)
  keeps feature consumers independent of the configured search and content implementations.
- [Marketplace Payable Ledger and Payout Batching](../capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md)
  records vendor proceeds, advances eligible funds, closes periods, and executes idempotent
  connected-account transfers.
- [Guided Storefront Checkout](../capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)
  guides a shopper through contact, address, delivery, payment, and order completion state.
- [Marketplace Vendor Operations](../capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md)
  provides authenticated catalog, customer, order, draft, configuration, and vendor-management
  workspaces.
- [Agent-Compatible Commerce](../capabilities/CAP-0005%20Agent-Compatible%20Commerce.md)
  exposes discoverable, version-negotiated catalog, cart, checkout-session, and order operations.
- [Storefront Discovery and Cart](../capabilities/CAP-0006%20Storefront%20Discovery%20and%20Cart.md)
  supports regional search, collections, product and vendor pages, and standard or vendor-aware
  carts.
- [Customer Account Self-Service](../capabilities/CAP-0007%20Customer%20Account%20Self-Service.md)
  covers authentication, profiles, addresses, orders, returns, saved payment methods, and account
  privacy.

## End-to-end flows

1. [Cart to Confirmed Order](../flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md) carries a
   shopper's cart through the guided checkout and payment boundary to a completed order and
   confirmation page.
2. [Paid Order to Vendor Transfer](../flows/FLOW-0002%20Paid%20Order%20to%20Vendor%20Transfer.md)
   turns paid vendor order proceeds into settled ledger lines, a closed payout batch, and a
   connected-account transfer.
3. [Agent Catalog to Checkout Session](../flows/FLOW-0003%20Agent%20Catalog%20to%20Checkout%20Session.md)
   carries an external agent from discovery and catalog operations to a managed checkout session,
   with escalation to the storefront when buyer or payment action is required.
4. [Marketplace Checkout to Vendor Orders](../flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md)
   combines vendor-specific checkouts into one customer payment and asynchronously completes them
   into separate orders.

These flows cross app-specific routes and shared service contracts; they do not imply that the
three web applications deploy or configure themselves as one unit.

## Integration map

| Contract                                                                                                                             | Product role                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Search Provider Selection](../integrations/INT-0001%20Search%20Provider%20Selection.md)                                             | Selects the commerce-backend, hosted-search, or built-in sample implementation behind storefront search.                            |
| [Content Provider Selection](../integrations/INT-0002%20Content%20Provider%20Selection.md)                                           | Selects the commerce-backend, hosted-CMS, or built-in sample implementation for pages and menus.                                    |
| [Stripe Connect Vendor Accounts and Transfers](../integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md) | Onboards vendor accounts, receives settlement events, and moves platform funds to eligible connected accounts.                      |
| [Agent-Compatible Storefront API](../integrations/INT-0004%20Agent-Compatible%20Storefront%20API.md)                                 | Advertises and negotiates the storefront's external catalog, cart, checkout-session, and order contract.                            |
| [Stripe Payment Application](../integrations/INT-0005%20Stripe%20Payment%20Application.md)                                           | Registers payment webhooks and translates commerce transaction requests to Stripe payment-intent operations.                        |
| [Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)                                                 | Supplies the default GraphQL commerce model, application lifecycle, transaction webhooks, and order events used across the product. |
| [Marketplace Checkout Payment Orchestration](../integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md)         | Coordinates one platform PaymentIntent, per-checkout transaction state, and asynchronous vendor-order completion.                   |

Search and content are intentionally provider-selectable. The commerce-backend, Stripe payment,
Stripe Connect, and agent-facing surfaces are separate contracts with separate configuration and
failure behavior; replacing one does not automatically replace the others.

## Layered implementation model

Product behavior follows a one-way dependency model:

- `packages/domain` defines pure commerce objects, errors, and `Result` values without framework or
  provider dependencies.
- `packages/foundation` supplies reusable integration-agnostic helpers and hooks, while
  `packages/ui` supplies reusable presentation primitives.
- `packages/infrastructure` implements external-provider adapters and use cases against domain and
  foundation contracts.
- `packages/features` composes domain data, provider-backed use cases, UI, and interaction logic
  into reusable storefront features.
- `apps/storefront`, `apps/marketplace`, and `apps/stripe` own routing, app-specific orchestration,
  authentication boundaries, environment configuration, and deployment surfaces.

The snapshot's
[shared package tree](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005/packages)
and
[application tree](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005/apps)
are the implementation evidence for this separation.

## Current product boundaries

- A zero-configuration storefront is bootable, not connected commerce. Without backend and payment
  configuration, production serves empty commerce data and hides checkout; non-production may use
  built-in sample search and content for exploration.
- Search and content provider choices are build-time selections. Changing a provider requires a
  rebuild, and selection does not add automatic cross-provider failover.
- The guided checkout depends on a configured payment application and Stripe credentials before it
  can complete a paid order.
- Marketplace checkout initialization currently trusts caller-supplied checkout identifiers and
  totals. Its per-checkout completion is non-atomic, and browser confirmation does not prove that
  every vendor checkout became an order.
- Marketplace settlement currently records gross order proceeds. Its batch model does not yet
  deduct platform fees, payment fees, or refunds, and currency conversion assumes two decimal
  places.
- A completed marketplace batch proves a platform-to-connected-account Transfer, not withdrawal to
  a vendor bank account.
- Agent negotiation validates protocol compatibility, not caller identity. Idempotency is
  process-local, and the advertised payment-handler registry is empty, so autonomous agent payment
  completion is outside the current contract.
- The payment application has narrower cancellation and refund behavior than its webhook surface
  suggests; its integration record is the authority for the currently implemented state handling.
- Commerce GraphQL types are generated from the configured backend schema. Deployments must
  regenerate and review those types when their backend schema changes.

## Provenance

- The complete current repository state is the immutable
  [`75d6bc55edddf431adcc348009a1c226f77cc005` snapshot](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005).
- The repository's public product summary and zero-configuration contract are preserved in the
  [README at that snapshot](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/README.md).
- Records first shipped in the earlier marketplace and agent-commerce wave use the exact
  [`v2.0.0` release commit](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- Provider-selection records use the exact
  [`v2.1.0` release commit](https://github.com/mirumee/nimara-ecommerce/tree/ba753fed1120d02e03d6d0676254dd4b9fac4f13)
  as their first released snapshot.

## Related Notes

[Product (MOC)](../Product%20%28MOC%29.md)
