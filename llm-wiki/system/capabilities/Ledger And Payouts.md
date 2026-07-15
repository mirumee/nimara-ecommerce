---
type: "Capability"
title: "Ledger And Payouts"
description: "Optional Postgres settlement ledger, payout batch lifecycle, and idempotent Stripe Connect transfer execution."
tags:
  - "capability"
  - "ledger"
  - "payouts"
  - "stripe-connect"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "partial"
direction_status: "untracked"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "apps/marketplace/src/lib/ledger"
  - "apps/marketplace/src/app/api/payouts"
  - "apps/marketplace/db/drizzle/0000_init_ledger.sql"
---

# Content

## Current implementation

When `DATABASE_URL` is configured, `ORDER_PAID` events create idempotent `order_gross` ledger
entries. Stripe settlement synchronization marks funds available. Closing a period groups
available, unconsumed entries by vendor and currency; executing a batch creates idempotent Stripe
Transfers to connected vendor accounts.

The schema includes vendor Stripe accounts, ledger entries, payout batches/items, transfers,
Stripe webhook events, and balance snapshots with explicit state enums and uniqueness constraints.

## Direction and gaps

- Only `order_gross` is currently ingested despite additional entry types in the schema.
- Fee calculation is not implemented; batch net equals gross.
- Settlement ends at Stripe Transfer and does not create/persist Stripe bank Payouts.
- Runtime authorization and webhook verification require further hardening evidence.

No explicit product direction covers the implemented ledger, period closure, payout batches,
fee/refund model, or bank-payout lifecycle in this level of detail. The capability is therefore
`untracked`: code is ahead of or more specific than documented direction, and implementation
alone does not establish readiness or ownership for these gaps.

## Evidence

Primary paths: marketplace ledger library, payout API routes, Stripe settlement handlers, and
`apps/marketplace/db/drizzle/0000_init_ledger.sql`.

# Related Notes

[Marketplace](../applications/Marketplace.md)
[Payments](./Payments.md)
[Ledger Settlement](../../tech/architecture/Runtime%20And%20Data%20Flows.md)
