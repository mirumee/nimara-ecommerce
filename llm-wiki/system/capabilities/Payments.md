---
type: "Capability"
title: "Payments"
description: "Stripe-backed payment capability with separate standard Saleor gateway and marketplace multi-vendor orchestration paths."
tags:
  - "capability"
  - "payments"
  - "stripe"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "partial"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/stripe"
  - "apps/marketplace/src/app/api/payments"
  - "apps/marketplace/src/lib/stripe"
  - "packages/infrastructure/src/payment"
---

# Content

## Current implementation

Nimara has two Stripe paths:

1. The standalone Stripe App integrates Saleor's Payment Gateway/Transaction API and stores
   channel configuration in Vercel Edge Config.
2. Marketplace payments create one PaymentIntent for multiple vendor sub-checkouts, synchronize
   Saleor transactions, and later enable Connect transfer settlement.

The storefront payment service is not provider-selectable on the reviewed `main`; Stripe is the
only concrete payment provider wired into the registry.

## Direction and gaps

Standard charge/init/process behavior exists, and core checkout/Stripe scope is established, while
Stripe App cancel/refund handlers remain incomplete. Payment-method switching, possible
overcharge, PayPal/cart, and validation defects remain open. Marketplace payment/settlement is
substantial but conditional. Invoice, tax, regeneration, and customer-view expansion is planned
and still being refined. Direction is active even though its next major feature group is planned.

## Evidence

Primary paths: `apps/stripe`, marketplace payment/Stripe code, and
`packages/infrastructure/src/payment/stripe`.

# Related Notes

[Stripe App](../applications/Stripe%20App.md)
[Ledger And Payouts](./Ledger%20And%20Payouts.md)
[Stripe Integration](../../tech/integrations/Stripe.md)
