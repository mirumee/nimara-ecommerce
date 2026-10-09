---
type: "Implementation Record"
title: "Marketplace Group Payment Through The Stripe App"
description: "Pays every vendor checkout of a marketplace order with one Stripe PaymentIntent that the Stripe payment application creates after every checkout has registered its transaction."
tags:
  - "implementation"
  - "payments"
  - "stripe"
  - "marketplace"
  - "saleor-app"
created: "2026-10-09T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "849"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/849"
relations:
  prds: []
  rfcs: []
  adrs:
    - "[ADR-0004 Marketplace Checkouts Pay As One Group Through The Payment Application](../ADR/ADR-0004%20Marketplace%20Checkouts%20Pay%20As%20One%20Group%20Through%20The%20Payment%20Application.md)"
  product_records:
    - "[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Marketplace Checkout Payment Orchestration](../../product/integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md)"
    - "[Marketplace Payment Group Contract](../../product/integrations/INT-0008%20Marketplace%20Payment%20Group%20Contract.md)"
    - "[Marketplace Checkout to Vendor Orders](../../product/flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/849"
verification:
  - criterion: "Caller metadata cannot override or add the keys the application routes events by or stores shares under."
    tests:
      - "apps/stripe/src/domain/event-mapping.test.ts"
      - "apps/stripe/src/services/handler/api/rest/saleor/webhooks/transactions.test.ts"
  - criterion: "A group event reaches every share's transaction with that share's amount, and malformed or mismatched shares report nothing."
    tests:
      - "apps/stripe/src/domain/payment-group.test.ts"
      - "apps/stripe/src/services/handler/api/rest/stripe/index.test.ts"
  - criterion: "A follower gets no PaymentIntent, and a leader creates one PaymentIntent only for a group that matches Saleor."
    tests:
      - "apps/stripe/src/services/handler/api/rest/saleor/webhooks/transactions.test.ts"
  - criterion: "Process answers a group member with its own share and never updates a group PaymentIntent."
    tests:
      - "apps/stripe/src/services/handler/api/rest/saleor/webhooks/transactions.test.ts"
  - criterion: "The storefront registers every follower before the leader opens the payment, and keeps the marketplace route without a payment app."
    tests:
      - "apps/storefront/src/features/payment/checkout/actions.test.ts"
  - criterion: "The marketplace payment webhook skips a PaymentIntent it did not create."
    tests:
      - "apps/marketplace/src/app/api/payments/stripe/webhooks/route.test.ts"
rollout: "Install the Stripe payment application on the marketplace commerce instance and configure it for the marketplace channel. Set that channel's transaction flow strategy to charge and keep automatic completion of fully paid checkouts off. Deploy the Stripe application and the marketplace before the storefront. Then set `NEXT_PUBLIC_PAYMENT_APP_ID` on the marketplace storefront and rebuild it; until then the storefront keeps the marketplace payment routes."
rollback: "Unset `NEXT_PUBLIC_PAYMENT_APP_ID` on the marketplace storefront and rebuild it; payment falls back to the marketplace routes, which this change leaves in place. Group PaymentIntents already confirmed still report through the Stripe application, so keep it installed until their events have landed."
---

# Implementation summary

A marketplace order is one Saleor checkout per vendor. The storefront now pays them as one payment
group through the Stripe payment application when a payment application is configured. Every
checkout except the first initializes a transaction that the application answers without a
PaymentIntent. The first checkout initializes last and names those transactions; the application
reads every checkout from Saleor, verifies the group, and creates one automatically captured
PaymentIntent with automatic payment methods for the sum of the shares, listing each share in its
metadata. The storefront mounts the Payment Element with that client secret and confirms on the
client.

The Stripe webhook reports each event about a group PaymentIntent to every share's transaction
with that share's amount. `transactionProcess` answers each member with its own share and never
updates a group PaymentIntent. Saleor and Stripe idempotency keys derive from the checkouts and
shares, so reloading the payment step reuses the same transactions and PaymentIntent.

The change also stops caller metadata from overriding the routing keys in the single-checkout
flow, makes the marketplace payment webhook skip PaymentIntents it did not create, shares the
in-flight confirmation request so a development double effect no longer sends the buyer to the
cart, and corrects the file configuration documentation of the payment application.

# Deviations

- The plan gated group payments per commerce domain in the payment application. The gate was
  dropped by decision: every allowed domain can start a group, and the storefront's payment
  application setting is the only switch.
- The plan used a separate storefront flag. The storefront instead takes the group path whenever a
  payment application is configured.
- Deferred-intent confirmation tokens and manual confirmation were rejected during design because
  Stripe refuses manual confirmation with automatic payment methods and BLIK does not support
  deferred intents. See ADR-0004.

# Verification evidence

`pnpm test` passed in every package: the Stripe application 170 tests, the storefront 53, the
marketplace 28.

End-to-end runs used the stage commerce instance, channel `channel-uk` in GBP, a locally run
Stripe application, and Stripe test mode. Each run used its own customer name:

| Test | Scenario                                    | Result                                                         |
| ---- | ------------------------------------------- | -------------------------------------------------------------- |
| T1   | Two vendors, card                           | Orders 3524 and 3525 fully paid                                |
| T2   | Card with 3-D Secure                        | Orders 3526 and 3527                                           |
| T3   | Three vendors                               | Orders 3528 to 3530, one PaymentIntent with three shares       |
| T4   | Revolut Pay redirect                        | Orders 3531 and 3532                                           |
| T5   | Storefront production build                 | Orders 3533 and 3534, order confirmation, empty cart           |
| T6   | Development build with the confirmation fix | Orders 3535 and 3536, one confirmation request                 |
| T7   | Declined card, then a valid card            | Failure on every share, then success on the same PaymentIntent |
| T8   | Payment step reloaded three times           | Same PaymentIntent and transactions; orders 3537 and 3538      |
| T9   | Bacs Direct Debit                           | Processing on every share, then success after about 90 seconds |
