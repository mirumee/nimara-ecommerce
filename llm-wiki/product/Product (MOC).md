---
type: "Map of Content"
title: "Product (MOC)"
description: "Current product-state register for capabilities, flows, and integration contracts at the selected Git ref."
tags:
  - "product"
  - "current-state"
  - "moc"
  - "index"
created: "2026-07-20T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

This MOC lists product behavior that is true at the selected Git ref. The overview synthesizes the
current product map; CAP, FLOW, and INT records define narrower behavior and contracts. When
behavior is removed, its record is removed from the current tree; Git preserves its history.

## Overview

- [Nimara Product Overview](overview/Product%20Overview.md) - Code-grounded map of actors, app surfaces, layered architecture, behavior, integration boundaries, and current limitations.

## Capabilities

<!-- Format: - CAP-NNNN Title - status - owner - one-line summary -->

- [CAP-0001 Swappable Storefront Search and Content Providers](capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md) - active - engineering - Selects search and content implementations through validated build-time configuration.
- [CAP-0002 Marketplace Payable Ledger and Payout Batching](capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md) - active - engineering - Records vendor proceeds, closes payable periods, and executes idempotent connected-account Transfers.
- [CAP-0003 Guided Storefront Checkout](capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md) - active - product-and-engineering - Guides standard and marketplace shoppers through required checkout and payment state.
- [CAP-0004 Marketplace Vendor Operations](capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md) - active - engineering - Provides vendor-isolated catalog, customer, order, configuration, and connected-account operations.
- [CAP-0005 Agent-Compatible Commerce](capabilities/CAP-0005%20Agent-Compatible%20Commerce.md) - active - product-and-engineering - Exposes discoverable, negotiated catalog, cart, checkout-session, and order operations.
- [CAP-0006 Storefront Discovery and Cart](capabilities/CAP-0006%20Storefront%20Discovery%20and%20Cart.md) - active - product-and-engineering - Supports regional discovery, product and vendor pages, and standard or vendor-aware carts.
- [CAP-0007 Customer Account Self-Service](capabilities/CAP-0007%20Customer%20Account%20Self-Service.md) - active - product-and-engineering - Supports account, profile, address, order, return, payment-method, and privacy operations.

## Flows

<!-- Format: - FLOW-NNNN Title - status - owner - one-line summary -->

- [FLOW-0001 Cart to Confirmed Order](flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md) - active - product-engineering-and-qa - Completes a standard checkout through payment and order confirmation.
- [FLOW-0002 Paid Order to Vendor Transfer](flows/FLOW-0002%20Paid%20Order%20to%20Vendor%20Transfer.md) - active - engineering - Converts paid vendor proceeds into settled ledger lines, payout batches, and connected-account Transfers.
- [FLOW-0003 Agent Catalog to Checkout Session](flows/FLOW-0003%20Agent%20Catalog%20to%20Checkout%20Session.md) - active - product-engineering-and-qa - Builds a channel-specific checkout session through a negotiated agent API.
- [FLOW-0004 Marketplace Checkout to Vendor Orders](flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md) - active - product-engineering-and-qa - Pays once for vendor-specific checkouts that complete asynchronously into separate orders.

## Integrations

<!-- Format: - INT-NNNN Title - status - owner - one-line summary -->

- [INT-0001 Search Provider Selection](integrations/INT-0001%20Search%20Provider%20Selection.md) - active - engineering - Selects and validates one storefront search implementation at build time.
- [INT-0002 Content Provider Selection](integrations/INT-0002%20Content%20Provider%20Selection.md) - active - engineering - Selects one validated storefront content implementation for pages and menus.
- [INT-0003 Stripe Connect Vendor Accounts and Transfers](integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md) - active - engineering - Onboards vendor accounts, verifies events, and creates idempotent Transfers.
- [INT-0004 Agent-Compatible Storefront API](integrations/INT-0004%20Agent-Compatible%20Storefront%20API.md) - active - engineering - Exposes negotiated, channel-aware catalog, cart, checkout, and order operations.
- [INT-0005 Stripe Payment Application](integrations/INT-0005%20Stripe%20Payment%20Application.md) - active - engineering - Connects standard checkout transactions to Stripe PaymentIntent operations and events.
- [INT-0006 Saleor Commerce Backend](integrations/INT-0006%20Saleor%20Commerce%20Backend.md) - active - engineering - Supplies core commerce state through GraphQL, application, and webhook contracts.
- [INT-0007 Marketplace Checkout Payment Orchestration](integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md) - active - engineering - Coordinates one platform payment across multiple vendor checkouts and orders.

## Related Notes

[Implementation (MOC)](../tech/implementation/Implementation%20%28MOC%29.md)
[Quality & Testing (MOC)](../quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Operations (MOC)](../operations/Operations%20%28MOC%29.md)
