---
type: "Application"
title: "Stripe App"
description: "Standalone Saleor Payment Gateway App using Stripe PaymentIntents and per-channel configuration."
tags:
  - "application"
  - "stripe"
  - "saleor-app"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "partial"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/stripe"
---

# Content

## Current implementation

The Stripe application is independent from marketplace payment orchestration. It installs into
Saleor, stores Stripe configuration per channel, registers synchronous Saleor payment webhooks,
creates and processes PaymentIntents, captures charges, and reports Stripe webhook outcomes to
Saleor's Transaction API. Configuration and the Saleor auth token are stored in Vercel Edge Config.

## Conditional behavior and gaps

The app requires Saleor, Stripe, Vercel Edge Config credentials, and Saleor App Bridge context.
Its manifest routes cancellation and refund requests, but the reviewed handlers retrieve the
PaymentIntent without calling Stripe cancel or refund operations. The environment example also
does not fully match the keys required by runtime configuration.

## Direction and gaps

Core Nimara Stripe and returns/refunds scope is treated as delivered, but current cancel/refund
handlers remain incomplete. Stripe invoice, tax, and customer-view expansion is planned and
still being refined, with no matching implementation observed. Direction is therefore planned
expansion layered over a delivery/implementation discrepancy in the existing gateway.

## Evidence

Primary paths: `apps/stripe/src/app/app`, `apps/stripe/src/app/api/saleor`,
`apps/stripe/src/app/api/stripe`, `apps/stripe/src/lib/saleor`, and `apps/stripe/src/config.ts`.

# Related Notes

[Payments](../capabilities/Payments.md)
[Stripe Integration](../../tech/integrations/Stripe.md)
[Checkout And Payments](../../tech/saleor/Checkout%20%26%20Payments.md)
