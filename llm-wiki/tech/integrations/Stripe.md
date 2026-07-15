---
type: "Integration Note"
title: "Stripe"
description: "Two Stripe integrations: a Saleor Payment Gateway App and marketplace PaymentIntent, Connect onboarding, ledger, and transfer orchestration."
tags:
  - "integration"
  - "stripe"
  - "stripe-connect"
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
  - "apps/marketplace/src/lib/stripe"
  - "apps/marketplace/src/app/api/payments"
  - "apps/marketplace/src/lib/ledger"
  - "packages/infrastructure/src/payment/stripe"
---

# Content

## Standard payment app

`apps/stripe` configures Stripe keys per Saleor channel, creates/processes/captures PaymentIntents,
listens for Stripe webhooks, and reports Transaction API events to Saleor. Configuration is
stored in Vercel Edge Config. Cancellation and refund handlers are routed but incomplete.

## Marketplace payment and Connect

Marketplace creates one PaymentIntent for multiple vendor checkouts, uses Express Connect
accounts for vendors, synchronizes successful payment with Saleor, and later executes separate
Stripe Transfers from payout batches. Transfers are not Stripe bank Payouts.

## Direction and gaps

Both integrations are conditional on secrets and webhook configuration. Core Stripe and vendor
payment behavior is established, but standard refund/cancel code remains incomplete and
marketplace readiness gaps persist. Invoice, Stripe Tax, regeneration, and customer-view
expansion is planned and still being refined, with no matching implementation observed.

## Evidence

Stripe App API/lib code, marketplace payment/Stripe/ledger code, and storefront payment adapter.

# Related Notes

[Payments](../../system/capabilities/Payments.md)
[Ledger And Payouts](../../system/capabilities/Ledger%20And%20Payouts.md)
[Stripe App](../../system/applications/Stripe%20App.md)
