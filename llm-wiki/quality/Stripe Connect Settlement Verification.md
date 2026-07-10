---
type: "QA Verification Plan"
title: "Stripe Connect Settlement Verification"
description: "Evidence map and remaining verification scenarios for marketplace onboarding, payment attribution, ledger settlement, payout batches, and Transfers."
tags:
  - "qa"
  - "marketplace"
  - "stripe-connect"
  - "ledger"
  - "payouts"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "active"
owner: "marketplace-qa"
source_refs:
  - "repo:apps/marketplace/src/app/(authenticated)/_actions/stripe-connect.test.ts"
  - "repo:apps/marketplace/src/app/api/stripe/connect/webhook/route.test.ts"
  - "repo:apps/marketplace/src/app/api/payments/payment-intent/route.ts"
  - "repo:apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts"
  - "repo:apps/marketplace/src/lib/ledger/close-payout-batch.ts"
  - "repo:apps/marketplace/src/lib/ledger/execute-payout-batch.ts"
---

# Content

## Current evidence

Existing focused unit tests cover Stripe Connect account creation, reuse of an existing account,
login-link creation, `account.updated` metadata synchronization, invalid webhook signatures,
missing vendor metadata, and missing signature headers.

These tests prove onboarding and account-state behavior. They do not prove the complete
financial sequence from customer payment through ledger availability and vendor Transfer.

## Required settlement scenarios

| Scenario                            | Evidence required                                                                | Current state                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Duplicate payment-intent request    | Same Stripe idempotency identity and no duplicate Saleor transaction reference   | Code-inspection evidence only                                                             |
| Mixed-currency sub-checkouts        | API returns 422 before PaymentIntent creation                                    | Code-inspection evidence only                                                             |
| Replayed `payment_intent.succeeded` | No second charge; checkout completion recovery is safe                           | Code-inspection evidence only                                                             |
| Replayed `ORDER_PAID`               | One `order_gross` ledger line for the economic event                             | Database integration test missing                                                         |
| Duplicate Stripe Connect event      | Webhook inbox prevents repeated side effects                                     | Database integration test missing                                                         |
| Funds still pending                 | Ledger line cannot enter a payout batch                                          | Database integration test missing                                                         |
| Period close                        | Eligible lines are consumed once and cutoff is stable                            | Database integration test missing                                                         |
| Batch retry after partial failure   | Successful Transfers are preserved and failed items can be deliberately requeued | **Implementation missing:** executor selects only `ready`, while failures become `failed` |
| Unauthorized close or execute       | Route returns 401 and performs no settlement mutation                            | Route tests missing                                                                       |
| Settlement boundary                 | No Stripe Payout object is persisted as a Transfer                               | Schema inspection complete                                                                |

## Minimum production-readiness gate

1. Add database-backed integration coverage for order ingest, settlement promotion, period
   close, and replay behavior.
2. Add route tests for payout authentication and invalid input.
3. Implement an explicit failed-item recovery transition, then run a Stripe test-mode scenario
   with at least two vendor accounts and one forced transfer failure.
4. Capture database rows and Stripe object IDs proving traceability from order to Transfer.
5. Resolve or explicitly accept the zero-decimal currency and payout-operator authorization
   gaps.

## Verdict policy

Documentation and source inspection can verify the implemented design, but they cannot produce
a `PASS` verdict for end-to-end settlement. Until the production-readiness gate is satisfied,
the solution status remains `implemented-with-gaps`.

# Related Notes

[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md)
[Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
[ADR-0001 Use Separate Charges and Transfers for Marketplace Settlement](tech/ADR/ADR-0001%20Use%20Separate%20Charges%20and%20Transfers%20for%20Marketplace%20Settlement.md)
[Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md)
