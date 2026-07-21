---
type: "Operational Record"
title: "Marketplace Payout Batch Execution and Recovery"
description: "Runbook for reviewing payable funds, closing an immutable payout period, executing connected-account Transfers, and handling partial batch outcomes."
tags:
  - "operations"
  - "marketplace"
  - "payouts"
  - "stripe-connect"
  - "recovery"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0004"
status: "active"
owner: "marketplace-operations-and-finance"
kind: "runbook"
relations:
  implementations: []
  product_records:
    - "[Marketplace Payable Ledger and Payout Batching](../product/capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md)"
    - "[Paid Order to Vendor Transfer](../product/flows/FLOW-0002%20Paid%20Order%20to%20Vendor%20Transfer.md)"
    - "[Stripe Connect Vendor Accounts and Transfers](../product/integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md)"
---

# Trigger

Use this runbook when an operator is ready to close a payable date range and currency, execute its
Stripe Connect Transfers, inspect a partially completed batch, or reconcile a batch whose recorded
state differs from Stripe.

# Preconditions

- Complete [ledger migration and settlement reconciliation](OPS-0003%20Marketplace%20Ledger%20Migration%20and%20Settlement%20Reconciliation.md).
- Confirm `DATABASE_URL`, the Stripe platform secret, operator authentication, and the intended
  Stripe mode. Verify the platform balance can cover the planned Transfers.
- Review every eligible `order_gross` line for the chosen currency and inclusive date range. Resolve
  unexpected amounts, vendor ownership, charge links, refunds, and fees before closing; the current
  writer represents gross proceeds and does not deduct those adjustments.
- Confirm each intended vendor has the correct connected account and Stripe reports payouts enabled.
  Vendors without an eligible account will be placed in skipped items.
- Nominate one operator for a period. Do not close overlapping date ranges for the same currency
  concurrently; the repository has no explicit cross-request close lock.

# Procedure

1. Read the authenticated payout overview and retain the pre-close line IDs, totals, currency,
   period, vendor-account state, and operator identity as the approval evidence.
2. Submit the date range and currency once to `POST /api/payouts/batches/close`. A successful close
   creates a locked batch, groups eligible positive lines by vendor, creates its items, and consumes
   those lines into the batch in one database transaction.
3. Treat the returned batch ID as immutable. If the response says `no_eligible_lines`, recheck funds
   availability, currency, date boundaries, and prior batch consumption instead of changing rows.
4. Inspect the locked batch before execution. Confirm ready versus skipped item counts, destination
   connected accounts, gross/net values, and that the current zero-fee model matches the approved
   operational expectation.
5. Execute that exact batch once through `POST /api/payouts/batches/{id}/execute`. The executor moves
   to `executing`, creates one Transfer for each positive `ready` item, and uses the deterministic
   idempotency key `payout:{batchId}:item:{itemId}`.
6. Record the response's processed count, per-item errors, and final batch status. Compare every paid
   item with its persisted provider Transfer before closing the operational task.

# Verification

- `paid` means all executable items have persisted Transfers; `partially_paid` means paid and failed
  items coexist; `failed` means failures exist without a paid sibling; `executing` means ready work
  remains.
- Confirm selected ledger lines remain linked to the batch and cannot appear in a later close.
- For each paid item, match amount, currency, destination, transfer group, idempotency key, vendor,
  and Stripe Transfer ID between the database and Stripe.
- Confirm signed Connect events update stored Transfer state when provider events arrive.
- Do not report vendor bank settlement from this evidence. The repository stops at a platform-to-
  connected-account Transfer and neither creates nor persists later bank payout objects.

# Escalation

- A second execution of a `locked`, `partially_paid`, or `executing` batch processes only items still
  in `ready`. Items already marked `failed` are not automatically reset or retried. There is no
  repository API for that repair; preserve state and escalate for an approved corrective procedure.
- There is no close reversal or unconsume endpoint. Do not edit batch, item, or ledger status
  directly during routine operation. A mistaken close requires engineering and finance review
  before any corrective database or compensating-transfer action.
- Stripe Transfer creation can succeed before local persistence fails. Before retrying or repairing,
  search Stripe by idempotency key and transfer group to avoid misclassifying an already-created
  Transfer.
- The repository does not automate Transfer reversals. Suspected wrong-destination, wrong-amount,
  duplicate, or compromised-account events require immediate payment-platform incident handling and
  finance approval.

# Provenance

- This procedure is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [batch close route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/payouts/batches/close/route.ts),
  [atomic close implementation](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/lib/ledger/close-payout-batch.ts),
  [execution route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/payouts/batches/%5Bid%5D/execute/route.ts),
  and
  [idempotent Transfer executor](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/lib/ledger/execute-payout-batch.ts).
