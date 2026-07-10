---
type: "Architecture Decision Record"
title: "ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement"
description: "Accept the Stripe separate-charges-and-transfers model with an internal availability-aware ledger and locked payout batches."
tags:
  - "adr"
  - "marketplace"
  - "stripe-connect"
  - "ledger"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "Accepted"
owner: "marketplace"
source_refs:
  - "repo:apps/marketplace/src/app/api/payments/payment-intent/route.ts"
  - "repo:apps/marketplace/src/lib/ledger/db/schema.ts"
  - "repo:apps/marketplace/src/lib/ledger/execute-payout-batch.ts"
---

# Context

A marketplace customer can buy from multiple vendors in one storefront interaction, while
Saleor represents the purchase as separate vendor checkouts and orders. Vendor funds must not
be transferred before the platform charge is available. Settlement must remain traceable and
retryable when Saleor webhooks, Stripe webhooks, operator requests, or network calls are
delivered more than once or fail partway through.

Creating destination charges per vendor would couple customer payment confirmation to vendor
routing. Immediate automatic transfers would make availability, period closing, partial
failure, and operator reconciliation difficult to represent. Stripe Payouts are controlled on
connected accounts and are a different lifecycle from the platform's obligation to transfer
vendor funds.

# Decision

We will charge the customer on the platform account with one PaymentIntent carrying a transfer
group and the constituent Saleor checkout IDs. We will record vendor entitlements in an
optional Postgres ledger, associate them with Stripe charge settlement, and make them eligible
only after Stripe funds are available.

We will close eligible ledger lines into immutable payout batches by currency and period. We
will initiate one Stripe Connect Transfer for each ready vendor batch item using a deterministic
idempotency key and persist the Stripe transfer record and status. Our persisted settlement
boundary ends at Stripe Transfer; we will not model connected-account bank Payout objects as
platform settlement records.

# Consequences

## Positive

- Customer payment is decoupled from vendor settlement timing.
- Availability and cutoff rules are explicit and auditable.
- Duplicate webhooks and transfer retries have stable idempotency identities.
- Partial batch failures can be observed without hiding successful Transfers.
- A vendor Transfer can be traced to a batch, ledger lines, orders, and the platform charge.

## Negative

- The marketplace owns a financial ledger and its operational database.
- Reconciliation spans Saleor orders, Stripe PaymentIntents and Charges, ledger entries, batches,
  and Transfers.
- Refunds, disputes, commissions, currency edge cases, and negative balances require additional
  ledger rules.
- Delayed settlement creates an operator workflow and monitoring responsibility.
- The current executor does not requeue `failed` batch items; implementing a controlled retry
  transition is required to complete partial-failure recovery.

## Neutral boundary

Connected-account bank withdrawal remains visible in Stripe rather than Nimara's settlement
tables. If Nimara later needs bank-payout reconciliation, that is a separate decision and data
model rather than an implicit extension of `stripe_transfers`.

# Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md)
[Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
[Stripe Connect Settlement Verification](quality/Stripe%20Connect%20Settlement%20Verification.md)
