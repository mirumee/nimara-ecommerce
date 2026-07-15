---
type: "Capability"
title: "Customer Accounts"
description: "Shopper identity, profile, address book, orders, returns, saved payment methods, privacy, and account deletion."
tags:
  - "capability"
  - "customer"
  - "account"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "wired"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/storefront/src/app/[locale]/(auth)"
  - "apps/storefront/src/app/[locale]/(main)/account"
  - "packages/infrastructure/src/user"
  - "packages/infrastructure/src/address"
  - "packages/infrastructure/src/fulfillment"
---

# Content

## Current implementation

Customer accounts support sign-in, registration, confirmation, password reset, profile/email/
password changes, address CRUD, order history, return requests, saved Stripe methods, privacy
settings, and account deletion. NextAuth and Saleor-backed services coordinate session and user
operations.

## Direction and gaps

Static wiring is present and account, authentication, and returns/refunds behavior is
established, but runtime behavior depends on Saleor and the payment integration. Guest-address
association remains incomplete, and broader account E2E coverage is planned.

## Evidence

Primary paths: storefront auth/account routes and infrastructure user/address/fulfillment services.

# Related Notes

[Storefront](../applications/Storefront.md)
[Account And Auth](../../tech/saleor/Account%20%26%20Auth.md)
[Customer](../../product/personas/Customer.md)
