---
type: "Product Capability"
title: "Marketplace Payable Ledger and Payout Batching"
description: "The marketplace records vendor order proceeds, exposes available funds, closes payable periods, and executes idempotent connected-account transfers."
tags:
  - "capability"
  - "marketplace"
  - "ledger"
  - "payouts"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "CAP-0002"
status: "active"
owner: "engineering"
relations:
  integrations:
    - "[Stripe Connect Vendor Accounts and Transfers](../integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Behavior

An order-paid event produces one `order_gross` ledger line for each vendor order. The line stores
the gross amount in minor units, starts as `pending_stripe`, and is idempotent on its source,
order-derived reference, and entry type. Reprocessing the same paid order therefore does not add a
second payable line.

Settlement data links the line to its payment charge and balance transaction. Once the provider's
availability date is reached, the line becomes `available`. The marketplace overview reports
pending and unconsumed available funds per vendor and exposes the outstanding ledger queue to an
operator.

Closing a currency and date period atomically creates a locked payout batch from positive,
available, unconsumed `order_gross` lines. Lines are grouped by vendor and marked as consumed by
that batch. A vendor with a linked account and payouts enabled receives a `ready` item; an
unlinked or disabled vendor receives a `skipped` item.

Executing a batch creates one connected-account Transfer for every positive `ready` item. Each
request uses a deterministic key derived from the batch and item, and each created Transfer is
persisted. Item failures are recorded independently, allowing the batch to finish as `paid`,
`partially_paid`, `failed`, or to remain `executing` when work is still ready.

# Actors

- Marketplace operators review pending and available proceeds, close a payout period, and execute
  its Transfers.
- Vendors accrue order proceeds and receive Transfers when their connected account is eligible.
- Payment and commerce webhooks supply the order-paid and settlement events that advance funds.

# Inputs and outputs

- Order-paid input supplies vendor ID, order ID, gross amount, currency, occurrence time, and an
  optional payment charge ID; output is a recorded or explicitly skipped ingest result.
- Settlement input supplies a charge's balance transaction and availability date; output is an
  updated funds status.
- Batch close input supplies period start, period end, currency, and operator identity; output is a
  locked batch ID and item count, or `no_database` / `no_eligible_lines`.
- Batch execution input supplies a locked or partially executed batch ID; output reports processed
  items, item errors, and the resulting batch status.

# Constraints and failure behavior

- `DATABASE_URL` is optional. Without it, order-paid ingest returns `skipped`, batch close returns
  `no_database`, and no ledger, account mapping, batch, or Transfer record is persisted.
- Gross conversion currently assumes every currency has two decimal places and multiplies its
  major-unit amount by 100. Zero-decimal and other non-two-decimal currencies are not handled.
- The current writer records only `order_gross` lines. Although the schema reserves platform-fee,
  payment-fee, and refund entry types, there are no ledger writers for them.
- Batch items therefore set `fees_minor` to zero and `net_minor` equal to `gross_minor`; payouts do
  not yet deduct platform fees, payment fees, or refunds.
- Closing consumes only available, positive, unconsumed order-gross lines in the requested currency
  and date window. Repeating a close can create another batch only when new eligible lines exist.
- Execution stops at provider Transfers from the platform account to connected accounts. Bank
  withdrawal objects from connected accounts are neither created nor persisted, so `paid` batch or
  item status does not prove that funds reached a vendor's bank.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [order-gross ingest](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/ingest-order-paid.ts),
  [ledger repository](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/repository.ts),
  [batch close](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/close-payout-batch.ts),
  and
  [Transfer execution](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/execute-payout-batch.ts)
  implementations described above.
