---
type: "Implementation Record"
title: "Saved Payment Methods In Marketplace Payment Groups"
description: "Lets a signed-in marketplace buyer pay a payment group with a saved payment method and save a new one."
tags:
  - "implementation"
  - "payments"
  - "stripe"
  - "marketplace"
  - "stored-payment-methods"
created: "2026-10-09T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "850"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/850"
relations:
  prds: []
  rfcs: []
  adrs:
    - "[ADR-0004 Marketplace Checkouts Pay As One Group Through The Payment Application](../ADR/ADR-0004%20Marketplace%20Checkouts%20Pay%20As%20One%20Group%20Through%20The%20Payment%20Application.md)"
  product_records:
    - "[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Marketplace Payment Group Contract](../../product/integrations/INT-0008%20Marketplace%20Payment%20Group%20Contract.md)"
    - "[Guided Storefront Checkout](../../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/850"
verification:
  - criterion: "Customer resolution and saved-method ownership behave as before for a single checkout and are shared with the group leader."
    tests:
      - "apps/stripe/src/services/handler/api/rest/saleor/webhooks/payment-customer.test.ts"
      - "apps/stripe/src/services/handler/api/rest/saleor/webhooks/transactions.test.ts"
  - criterion: "A signed-in buyer's group PaymentIntent carries the gateway customer and the save choice, a guest's save request is dropped, and every choice has its own idempotency key."
    tests:
      - "apps/stripe/src/services/handler/api/rest/saleor/webhooks/transactions.test.ts"
  - criterion: "The leader operation sends the save choice and keys the Saleor transaction by it."
    tests:
      - "packages/infrastructure/src/payment/stripe/infrastructure/payment-group-initialize-infra.test.ts"
  - criterion: "The marketplace payment action passes the save choice to the leader and to a single checkout."
    tests:
      - "apps/storefront/src/features/payment/checkout/actions.test.ts"
rollout: "Ship after IMP-0007. No configuration beyond it: saved methods appear in marketplace checkout for signed-in buyers when the storefront has a payment application configured."
rollback: "Revert the pull request. Group payments keep working without a gateway customer; methods already saved stay attached to the buyer's gateway customer and remain usable in the standard checkout."
---

# Implementation summary

The group leader resolves the buyer's gateway customer with the same helper the single-checkout
initialization now uses, and creates the group PaymentIntent with that customer and, when the
buyer asks, set up for future use. The payment step opens the group payment once. Paying with a
saved method confirms that payment on the client with the method's ID, and Stripe refuses a method
that belongs to another customer. The Saleor and Stripe idempotency keys include the save choice,
and the Stripe key also the customer.

The marketplace payment step gains the saved and new method tabs and the save checkbox when a
payment application is configured. Confirming without a payment element no longer sends billing
details as new payment-method data, which Stripe rejects without a type; that also corrects the
standard checkout's saved-method payment.

# Deviations

- The plan bound the saved method when the leader created the PaymentIntent. Two reviews showed
  that this opened a new PaymentIntent for every attempt over the same follower transactions, so a
  lost response could charge twice and a retry after a decline needed a new group verification.
  The saved method is now named at confirmation instead, and the leader ignores one sent to it.
- A stale payment-session response could mount the payment form on an intent with the opposite
  save choice; only the latest request is applied.

# Verification evidence

`pnpm test` passed in every package: the Stripe application 185 tests and the storefront 55, plus
the new group initialization tests in the infrastructure package.

End-to-end runs used the stage commerce instance, channel `channel-uk` in GBP, a locally run
Stripe application, and Stripe test mode, with a signed-in test account unless noted:

| Test | Scenario                                     | Result                                                             |
| ---- | -------------------------------------------- | ------------------------------------------------------------------ |
| T10  | New card with save checked                   | Payment succeeded; the card was saved with redisplay consent       |
| T11  | Saved card                                   | Payment succeeded with the saved method and no payment form        |
| T12  | Guest                                        | No saved methods or checkbox; payment succeeded without a customer |
| T13  | Save checkbox turned off and on              | A second PaymentIntent, then the first one again                   |
| T14  | Declined saved card, then another saved card | Success on the same PaymentIntent and transactions                 |
| T15  | Saved method of another customer             | Stripe refused the confirmation                                    |
