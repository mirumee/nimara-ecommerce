---
type: "Technical Solution"
title: "Stripe Connect Split Payments Solution"
description: "Implemented solution connecting the Stripe Connect initiative to its settlement decision, runtime flow, code, and verification evidence."
tags:
  - "solution"
  - "marketplace"
  - "stripe-connect"
  - "ledger"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "implemented-with-gaps"
owner: "marketplace"
source_refs:
  - "wiki:product/strategy/initiatives/2 - Stripe Connect Split Payments.md"
  - "repo:apps/marketplace/src/app/api/payments/payment-intent/route.ts"
  - "repo:apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts"
  - "repo:apps/marketplace/src/lib/ledger/db/schema.ts"
  - "repo:apps/marketplace/src/lib/ledger/close-payout-batch.ts"
  - "repo:apps/marketplace/src/lib/ledger/execute-payout-batch.ts"
required_relations:
  - "product/strategy/initiatives/2 - Stripe Connect Split Payments.md"
  - "tech/ADR/ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement.md"
  - "tech/flows/Marketplace Ledger and Payout Flow.md"
  - "quality/Stripe Connect Settlement Verification.md"
---

# Content

## Tracer

| Stage        | Durable artifact                                                                                                 | What it proves                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Initiative   | [2 - Stripe Connect Split Payments](product/strategy/initiatives/2%20-%20Stripe%20Connect%20Split%20Payments.md) | Business outcome and settlement boundary                 |
| Solution     | This page                                                                                                        | Components and responsibility split                      |
| Decision     | [ADR-0001](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md)   | Why charges, ledger batches, and Transfers are separated |
| Runtime flow | [Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)                   | Executable sequence and invariants                       |
| Code         | `source_refs` and the component map below                                                                        | Current implementation evidence                          |
| QA           | [Stripe Connect Settlement Verification](quality/Stripe%20Connect%20Settlement%20Verification.md)                | Proven coverage and remaining gaps                       |

## Solution outline

The storefront maintains one Saleor checkout per vendor but initializes one platform
PaymentIntent for the combined customer payment. Saleor transactions retain each sub-checkout's
authorized and charged amount. Order-paid events create vendor-attributed ledger entitlements.
Stripe balance availability controls when those entitlements become eligible. Operators close
a period into a stable batch, then execute Stripe Connect Transfers per vendor item.

## Component map

| Responsibility                                           | Implementation                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| Aggregate marketplace payment                            | `apps/storefront/src/foundation/checkout/sections/payment/actions.ts` |
| Create PaymentIntent and Saleor transaction references   | `apps/marketplace/src/app/api/payments/payment-intent/route.ts`       |
| Apply successful charge and complete sub-checkouts       | `apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts`      |
| Ingest paid order into ledger                            | `apps/marketplace/src/app/api/saleor/webhooks/order-paid/route.ts`    |
| Persist ledger, batches, items, transfers, webhook inbox | `apps/marketplace/src/lib/ledger/db/schema.ts`                        |
| Track Stripe availability                                | `apps/marketplace/src/lib/stripe/process-ledger-stripe-webhook.ts`    |
| Lock eligible lines into a batch                         | `apps/marketplace/src/lib/ledger/close-payout-batch.ts`               |
| Execute idempotent vendor Transfers                      | `apps/marketplace/src/lib/ledger/execute-payout-batch.ts`             |
| Persist initial schema                                   | `apps/marketplace/db/drizzle/0000_init_ledger.sql`                    |

## Layer placement

This solution is marketplace-app-specific because it coordinates Saleor App installation,
Stripe Connect, Postgres, privileged webhooks, and operator routes. Shared domain-facing
storefront payment and checkout contracts remain in infrastructure packages; the optional
marketplace settlement database does not leak into `@nimara/domain` or shared UI.

## Known gaps

- End-to-end payout execution is not covered by the existing targeted unit tests.
- Current minor-unit conversion assumes two decimal places.
- Payout routes authenticate a token but do not express a fine-grained operator role policy.
- Failed batch items are persisted with `failed` status but are not selected by subsequent
  executions, which currently select only `ready` items. An explicit requeue/retry transition
  is not implemented.
- Refund, dispute, commission, and negative-balance accounting need explicit scenarios before
  production settlement can be considered complete.
- Stripe connected-account bank Payouts remain intentionally outside the persistence boundary.

# Related Notes

[2 - Stripe Connect Split Payments](product/strategy/initiatives/2%20-%20Stripe%20Connect%20Split%20Payments.md)
[ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md)
[Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
[Stripe Connect Settlement Verification](quality/Stripe%20Connect%20Settlement%20Verification.md)
