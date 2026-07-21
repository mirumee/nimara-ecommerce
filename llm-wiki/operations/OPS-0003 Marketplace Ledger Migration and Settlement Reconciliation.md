---
type: "Operational Record"
title: "Marketplace Ledger Migration and Settlement Reconciliation"
description: "Runbook for preparing the optional marketplace ledger database, applying Drizzle migrations, and reconciling open order proceeds with Stripe settlement state."
tags:
  - "operations"
  - "marketplace"
  - "ledger"
  - "postgres"
  - "settlement"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0003"
status: "active"
owner: "marketplace-operations"
kind: "runbook"
relations:
  implementations: []
  product_records:
    - "[Marketplace Payable Ledger and Payout Batching](../product/capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md)"
    - "[Paid Order to Vendor Transfer](../product/flows/FLOW-0002%20Paid%20Order%20to%20Vendor%20Transfer.md)"
    - "[Stripe Connect Vendor Accounts and Transfers](../product/integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md)"
    - "[Saleor Commerce Backend](../product/integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
---

# Trigger

Use this runbook before enabling the marketplace ledger in an environment, after deploying a new
ledger migration, when order proceeds remain `pending_stripe`, or when Stripe settlement metadata
must be reconciled before closing a payout period.

# Preconditions

- Provision PostgreSQL and set `DATABASE_URL` for both the migration process and the marketplace
  runtime. Without it, the migration command exits successfully after skipping work and ledger APIs
  report an unconfigured database.
- Back up the database and record the application commit, migration folder contents, current Drizzle
  migration-table state, Stripe mode, and Saleor domain before applying a new migration.
- Apply migrations with a role allowed to create and alter ledger objects. Run the marketplace with
  the narrower runtime permissions appropriate to its repository operations where deployment
  infrastructure supports separate roles.
- Confirm the marketplace application token, Stripe secret, authenticated operator access, and the
  order-paid and Stripe Connect webhook endpoints are configured.
- Do not begin a ledger migration while a payout batch is being closed or executed.

# Procedure

1. Check out the exact application ref to deploy and inspect `apps/marketplace/db/drizzle/` plus the
   generated Drizzle journal. Confirm every new migration is forward-only and has a reviewed backup
   recovery plan.
2. Point `DATABASE_URL` at the intended database and run `pnpm migrate:ledger` from the repository
   root. Require the `Ledger migrations applied` message; the missing-variable skip message is not a
   successful migration for an enabled ledger.
3. Deploy the marketplace with the same database target. From an authenticated marketplace session,
   read `/api/payouts/overview` and require `configured: true` before accepting order-paid traffic.
4. Verify new paid vendor orders produce one idempotent `order_gross` line with vendor, order,
   currency, amount, occurrence time, and any resolved Stripe charge reference.
5. Before payout closing, call the authenticated settlement sync endpoint
   `POST /api/payouts/ledger/sync-stripe`. Use `chargeLimit` only to bound a deliberate batch of open
   charges, up to the route's maximum of 2000.
6. Review `chargeIdsAttempted`, `chargesSynced`, `chargeErrors`, and `promotedByDateCount`. Resolve
   charge-specific errors, then rerun the bounded sync; successful charges can progress even when
   another charge fails.
7. Re-read the overview and confirm due lines moved from `pending_stripe` to `available` only after a
   Stripe balance transaction and availability date were recorded.

# Verification

- Confirm the Drizzle migration table reflects the exact migrations shipped with the deployed ref.
- Confirm `/api/payouts/overview` reports the expected ledger lines, currency, pending/available
  totals, recent batches, and vendor scope for the authenticated principal.
- Replay one known order-paid event in a controlled environment and verify the unique source key
  prevents a duplicate gross line.
- Compare a sample ledger charge ID, balance transaction, availability date, amount, and currency
  with Stripe. Remember that current gross conversion assumes two decimal places.
- Keep evidence of the migration output, reconciliation counts, unresolved charge IDs, application
  ref, and database backup identifier without storing credentials or payment payloads.

# Escalation

- There is no repository-provided down-migration command. On migration failure, stop ledger writers,
  preserve logs, and restore the reviewed database backup or apply a separately reviewed corrective
  migration; redeploying old code alone does not reverse schema changes.
- Do not manually mark pending lines available. Investigate missing charge links, Stripe balance
  transactions, availability dates, mode mismatches, and provider access first.
- The order-paid route validates the configured commerce domain but does not currently verify an
  event signature. Restrict delivery at the application or network boundary and escalate unexpected
  callers or payloads before trusting newly ingested lines.
- Escalate zero-decimal or non-two-decimal currencies, inconsistent vendor metadata, duplicate source
  references, or any mismatch between ledger gross and the canonical commerce order.

# Provenance

- This procedure is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [ledger migration runner](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/scripts/migrate-ledger.mjs),
  [order-paid ingest route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/saleor/webhooks/order-paid/route.ts),
  [settlement synchronization](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/lib/ledger/sync-ledger-settlement-from-stripe.ts),
  and
  [authenticated overview](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/payouts/overview/route.ts).
