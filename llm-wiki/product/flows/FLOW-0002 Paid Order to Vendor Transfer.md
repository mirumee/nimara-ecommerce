---
type: "Product Flow"
title: "Paid Order to Vendor Transfer"
description: "A paid vendor order becomes an available ledger line, a locked payout-batch item, and an idempotent transfer to the vendor's connected account."
tags:
  - "flow"
  - "marketplace"
  - "ledger"
  - "payouts"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "FLOW-0002"
status: "active"
owner: "engineering"
relations:
  capabilities:
    - "[Marketplace Payable Ledger and Payout Batching](../capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md)"
    - "[Marketplace Vendor Operations](../capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md)"
  integrations:
    - "[Stripe Connect Vendor Accounts and Transfers](../integrations/INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
actors:
  - "Marketplace operator"
  - "Vendor"
  - "Commerce backend"
  - "Stripe Connect"
---

# Preconditions

- The marketplace app is configured for the commerce domain, and the commerce backend sends a paid
  order event carrying a resolvable order identifier.
- The order or its lines identify one vendor and expose a finite gross total and currency.
- `DATABASE_URL` is configured and the marketplace ledger migrations have been applied.
- The order is linked to a Stripe charge whose balance transaction exposes an availability date.
- Before execution, the vendor has a connected account recorded in the ledger and Stripe reports
  payouts enabled for it.
- An authenticated marketplace operator selects the payout period and currency, then explicitly
  closes and executes the resulting batch.

# Main flow

1. The commerce backend sends the order-paid event. The marketplace resolves the domain's app
   configuration, fetches the canonical order snapshot when possible, and derives the vendor,
   order gross, currency, occurrence time, and Stripe charge link.
2. The marketplace inserts an idempotent `order_gross` ledger entry in `pending_stripe` state. If
   the event is replayed for the same order-derived reference, the unique ledger key prevents a
   second payable line.
3. Settlement synchronization retrieves the charge and its balance transaction from Stripe,
   records the balance transaction and availability date, and promotes due pending lines to
   `available`. The order-paid handler attempts this immediately; an operator can also run the
   authenticated settlement-sync route for open lines.
4. The operator closes a date range for one currency. In one database transaction, the marketplace
   selects positive, available, unconsumed order-gross lines, groups them by vendor, creates a
   locked payout batch, creates its vendor items, and marks the selected lines as consumed by that
   batch. Vendors without a payout-enabled connected account become `skipped` items.
5. The operator executes the locked batch. Each positive `ready` item sends one Transfer to the
   vendor's connected account with a deterministic batch-item idempotency key and transfer group.
   The marketplace persists the provider Transfer and marks the item paid, or records that item's
   failure without undoing successful siblings.
6. The batch resolves to `paid`, `partially_paid`, `failed`, or remains `executing` according to its
   item counts. Later signed Stripe Connect events update the persisted provider Transfer state.

# Failure paths

- A missing commerce-domain header or unconfigured app is rejected. An unparseable order, missing
  vendor, or missing gross total is acknowledged as skipped and produces no ledger line.
- Without `DATABASE_URL`, order-paid ingest is acknowledged as skipped, settlement synchronization
  and batch close report that the database is unavailable, and no transfer execution is possible.
- Without a charge link or balance-transaction availability date, the ledger line cannot advance
  to `available` through this flow. Charge retrieval failures are recorded per charge by the
  operator-triggered sync so other charges can continue.
- Closing an empty or already consumed date range returns `no_eligible_lines`. Close and consume
  happen in one database transaction, but there is no explicit cross-request lock for overlapping
  close attempts; operators should avoid closing the same currency and period concurrently.
- A missing or payout-disabled vendor account creates a skipped batch item. Transfer API or
  persistence failures mark the affected item failed and can leave the batch partially paid.
- The commerce order-paid route currently validates the configured domain but does not verify an
  event signature. Deployments must restrict delivery to the registered endpoint and treat this as
  a trust boundary.
- Gross conversion assumes a two-decimal currency. Zero-decimal and other non-two-decimal currencies
  can be represented incorrectly.

# Result

The vendor's Stripe connected-account balance receives one idempotent Transfer for each successfully
executed ready batch item, and the marketplace retains the source ledger lines, batch, batch items,
and provider Transfer state needed to explain the operation. This flow ends at the connected-account
Transfer; it does not create, persist, or reconcile the later bank payout, so a `paid` marketplace
item does not prove that funds reached the vendor's bank.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [order-paid event handler](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/api/saleor/webhooks/order-paid/route.ts),
  [settlement synchronization](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/sync-ledger-settlement-from-stripe.ts),
  [atomic batch close](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/close-payout-batch.ts),
  and
  [idempotent Transfer execution](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/ledger/execute-payout-batch.ts)
  described above.
