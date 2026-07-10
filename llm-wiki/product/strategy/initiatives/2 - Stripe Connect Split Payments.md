---
type: "Strategic Initiative"
title: "2 - Stripe Connect Split Payments"
description: "Now-tier initiative for auditable vendor settlement through a platform charge, an internal ledger, payout batches, and Stripe Connect Transfers."
tags:
  - "strategy"
  - "initiative"
  - "marketplace"
  - "stripe-connect"
  - "payouts"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "active"
owner: "marketplace"
source_refs:
  - "wiki:product/strategy/Marketplace & Agentic Commerce Bets.md"
  - "repo:apps/marketplace/src/app/api/payments/payment-intent/route.ts"
  - "repo:apps/marketplace/src/lib/ledger/execute-payout-batch.ts"
---

# Content

## Outcome

Nimara can accept one customer payment for marketplace sub-checkouts, attribute seller
entitlements, wait for Stripe funds availability, close an auditable settlement period, and
initiate idempotent Stripe Transfers to connected vendor accounts.

## Implemented boundary

The current implementation uses Stripe's separate-charges-and-transfers model. It records
gross order lines in an optional Postgres ledger, associates them with Stripe charges and
availability dates, consumes eligible lines into locked payout batches, and executes one
Transfer per ready vendor batch item. The settlement boundary ends at Stripe Transfer; bank
withdrawals represented by Stripe Payout objects are not persisted.

## Success criteria

- Replayed Saleor and Stripe webhooks do not duplicate financial effects.
- Only available, unconsumed ledger lines enter a batch.
- A closed batch preserves the cutoff and the exact lines it consumed.
- Retrying batch execution reuses deterministic idempotency keys.
- Partial failures remain visible and retryable without replaying successful transfers.
- Operators can trace a vendor transfer back to its batch, ledger lines, order, and payment.

## Explicit non-goals for this iteration

- Persisting or reconciling connected-account bank payouts.
- Multi-currency netting inside one payout batch.
- Automated tax, commission, refund, and dispute accounting beyond the implemented ledger
  entry types.

## Delivery tracer

The implementation chain continues in
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md),
which links the governing decision, runtime flow, code evidence, and QA verification plan.

# Related Notes

[Initiative Prioritization](product/strategy/initiatives/Initiative%20Prioritization.md)
[Marketplace & Agentic Commerce Bets](product/strategy/Marketplace%20%26%20Agentic%20Commerce%20Bets.md)
[Marketplace Vendor](product/personas/Marketplace%20Vendor.md)
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md)
