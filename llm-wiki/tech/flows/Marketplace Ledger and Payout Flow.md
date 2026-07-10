---
type: "Technical Flow"
title: "Marketplace Ledger and Payout Flow"
description: "How marketplace orders become settled ledger entries, locked payout batches, and idempotent Stripe Connect Transfers."
tags:
  - "architecture"
  - "marketplace"
  - "ledger"
  - "payouts"
  - "stripe-connect"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "marketplace"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "repo:apps/marketplace/src/app/api/saleor/webhooks/order-paid/route.ts"
  - "repo:apps/marketplace/src/lib/ledger/ingest-order-paid.ts"
  - "repo:apps/marketplace/src/lib/stripe/process-ledger-stripe-webhook.ts"
  - "repo:apps/marketplace/src/lib/ledger/close-payout-batch.ts"
  - "repo:apps/marketplace/src/lib/ledger/execute-payout-batch.ts"
  - "repo:apps/marketplace/src/lib/ledger/db/schema.ts"
  - "repo:apps/marketplace/db/drizzle/0000_init_ledger.sql"
---

# Content

## Sequence

1. A Saleor `ORDER_PAID` webhook identifies the order and loads a fresh order snapshot using
   the installed app token.
2. Vendor identity is resolved from order metadata and then product metadata. Gross amount,
   currency, order timestamp, and Stripe charge identity form the ledger input.
3. When `DATABASE_URL` is configured, an idempotent `order_gross` ledger entry is inserted.
   Its source reference uniquely identifies the order-paid economic event.
4. The Stripe charge is associated with the order and ledger row. `charge.succeeded` or an
   explicit synchronization resolves the balance transaction and `available_on`; rows become
   eligible only after Stripe funds are available.
5. Closing a payout period selects available, unconsumed rows for one currency, records a
   cutoff, creates vendor batch items, and marks the selected ledger entries with
   `consumed_in_batch_id` inside the repository transaction.
6. Executing the locked batch creates one Stripe Connect Transfer per ready vendor item. The
   idempotency key is `payout:<batch-id>:item:<item-id>` and each result is persisted.
7. Batch state becomes `paid`, `partially_paid`, `failed`, or remains `executing` according to
   item outcomes. Stripe transfer webhooks reconcile persisted transfer status.

## Financial invariants

- `DATABASE_URL` is optional; without it ledger ingestion is explicitly skipped and payout
  operations are unavailable.
- Monetary ledger values use integer minor units. The current Saleor conversion assumes
  two-decimal fiat currencies and does not yet cover zero-decimal currencies.
- Replayed order-paid events do not create duplicate `order_gross` lines.
- Stripe webhook events are stored in an inbox keyed by Stripe event ID before side effects.
- Only `funds_status=available` and unconsumed lines can enter a new batch.
- A ledger line belongs to at most one closed batch.
- Each attempted Transfer uses a deterministic Stripe idempotency key.
- Settlement ends at Stripe Transfer to a connected account. Stripe Payout objects representing
  connected-account bank withdrawals are outside the persisted model.

## Operational boundaries

Closing and execution routes require an API bearer token or authenticated cookie. The code
currently proves presence of a token at those route boundaries; authorization policy for which
authenticated roles may operate payouts should remain an explicit security review item.

## Recovery paths

- `payouts/ledger/sync-stripe` re-reads open charge settlement from Stripe and promotes rows
  whose availability date has passed.
- Failed batch items preserve their reason, but the current executor only selects `ready` items.
  There is no implemented transition that requeues a `failed` item, so partial-failure recovery
  requires code work rather than another execution request.
- Duplicate Stripe Connect events return `duplicate` before applying side effects again.

# Related Notes

[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Checkout and Payment Flow](tech/flows/Checkout%20and%20Payment%20Flow.md)
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md)
[ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md)
[Stripe Connect Settlement Verification](quality/Stripe%20Connect%20Settlement%20Verification.md)
