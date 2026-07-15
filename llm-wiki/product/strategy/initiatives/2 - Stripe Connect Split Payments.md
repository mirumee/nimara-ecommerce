---
type: "Strategic Initiative"
title: "2 - Stripe Connect Split Payments"
description: "Research-derived marketplace payment proposal compared with the split-payment and transfer code currently present on main."
tags:
  - "strategy"
  - "marketplace"
  - "stripe-connect"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
status: "research_proposal"
knowledge_status: "mixed"
implementation_status: "partial"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/marketplace/src/app/api/payments"
  - "apps/marketplace/src/lib/ledger"
  - "apps/marketplace/src/lib/stripe"
  - "apps/storefront/src/app/[locale]/(checkout)"
---

# Content

## Research proposal

The June 2026 strategy research proposed production-grade Stripe Connect split payments as a
core marketplace differentiator. Marketplace is an active product direction, but that does not
by itself establish production readiness.

## Current implementation

The Marketplace application already contains Stripe Connect onboarding, vendor-aware
PaymentIntent handling, an optional Postgres ledger, payout batches, and Stripe Transfers to
connected accounts. This is meaningful implementation progress, but the settlement model ends
at Transfers; bank-withdrawal Stripe Payout objects are not persisted. Current ledger ingest
also records a narrower financial model than the database schema suggests.

## Direction and gaps

Multivendor cart, vendor payment, and seller-order splitting are established slices. Code
broadly matches that direction, but its detailed ledger/batch model is more specific than the
product definition. Fee and refund behavior, authorization, reconciliation duties, and the
definition of "production-grade" remain gaps.

## Evidence

- Directional source: [Initiative Prioritization](./Initiative%20Prioritization.md).
- Code baseline: [Main e32732e Snapshot](../../../sources/codebase/Main%20e32732e%20Snapshot.md).

# Related Notes

[Payments](../../../system/capabilities/Payments.md)
[Ledger And Payouts](../../../system/capabilities/Ledger%20And%20Payouts.md)
[Stripe](../../../tech/integrations/Stripe.md)
