---
type: "Integration Contract"
title: "Stripe Connect Vendor Accounts and Transfers"
description: "Server-side contract for vendor Express account onboarding, signed status events, and idempotent Transfers from marketplace payout batches."
tags:
  - "integration"
  - "marketplace"
  - "stripe-connect"
  - "payouts"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0003"
status: "active"
owner: "engineering"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Purpose

The marketplace gives each vendor a Stripe Express connected account and uses that account as the
destination for marketplace payout-batch Transfers. Account creation writes the vendor identifier
and commerce-domain linkage into account metadata, stores the account ID and connection flag on the
vendor profile, and, when the optional ledger database exists, upserts the account's payout state
for batch eligibility.

# Authentication and permissions

- Onboarding, status sync, and dashboard-link operations run as server actions and require both the
  authenticated vendor token and that vendor's profile ID.
- Outbound account, link, status, and Transfer calls use the server-side Stripe secret key. The key
  is never accepted from the vendor or returned to the client.
- Express account creation configures the application as the fees payer and loss controller.
- Connect webhook requests require a `stripe-signature` over the raw body. Verification uses the
  configured Connect webhook secret, timing-safe HMAC comparison, and a five-minute timestamp
  tolerance; missing, malformed, stale, or invalid signatures are rejected before event handling.

# Events and operations

1. On first onboarding, the marketplace creates an Express account and links it to the vendor
   profile. Later onboarding attempts reuse that account and request a fresh single-use onboarding
   link.
2. An onboarded vendor can request an Express dashboard login link. An explicit status sync can
   retrieve the account and reconcile vendor metadata and the optional ledger account row.
3. A signed `account.updated` event performs the same reconciliation using the vendor and commerce
   domain recorded in account metadata.
4. A payout-batch item creates a Transfer to its connected-account destination with batch and
   vendor metadata and a batch-specific Transfer group.
5. Signed charge and balance events advance ledger availability and record platform balance
   snapshots. Signed Transfer events update the persisted Transfer lifecycle.

# Failure handling and idempotency

- Every batch-item Transfer uses `payout:<batch-id>:item:<item-id>` as its provider idempotency key.
  The database also requires unique provider Transfer IDs and idempotency keys, protecting the
  local record from duplicates.
- Ledger-relevant webhook event IDs are inserted once. A duplicate event is acknowledged as a
  duplicate without replaying its side effects.
- An `account.updated` event without a vendor identifier is acknowledged as skipped. Missing account
  ID or an invalid signature is rejected; a missing commerce domain or failed reconciliation is a
  server error so delivery can be retried.
- Transfer creation failures mark only that batch item as failed. Successfully created Transfers
  and their items remain recorded, and the enclosing batch reports partial or complete failure from
  item counts.

# Limitations

- Account connection and payout eligibility are separate states. `connected` means details were
  submitted and no requirements are currently due; only the independent `payouts_enabled` value
  makes a batch item `ready`.
- A successful Transfer API response immediately marks the payout item as `paid` and stores the
  Transfer itself as `created`. Later signed Transfer events may advance that provider record to
  `in_transit`, `paid`, `failed`, `reversed`, or `canceled`. The batch/item state and provider
  Transfer state therefore answer different questions.
- This contract ends at a Stripe Transfer into the vendor's connected account. It does not create,
  persist, or reconcile the subsequent Stripe Payout from that account to a bank.
- Without `DATABASE_URL`, vendor-profile onboarding and connection metadata still work, but the
  ledger account mapping, webhook inbox, Transfer records, and payout-batch execution state are not
  available.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9).
- The immutable snapshot contains the
  [Express account and signature contract](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/stripe/connect.ts),
  [authenticated onboarding actions](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/%28authenticated%29/_actions/stripe-connect.ts),
  [Connect webhook route](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/api/stripe/connect/webhook/route.ts),
  and
  [Transfer client](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/lib/stripe/payout-api.ts)
  described above.
