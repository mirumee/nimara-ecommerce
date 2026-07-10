---
type: "Technical Flow"
title: "Checkout and Payment Flow"
description: "How standard and marketplace checkouts move from storefront state through payment initialization, Saleor transactions, and order completion."
tags:
  - "architecture"
  - "checkout"
  - "payments"
  - "stripe"
  - "marketplace"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "checkout"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "repo:apps/storefront/src/app/[locale]/(checkout)/checkout/page.tsx"
  - "repo:apps/storefront/src/features/checkout/checkout-actions.ts"
  - "repo:apps/storefront/src/foundation/checkout/sections/payment/actions.ts"
  - "repo:apps/marketplace/src/app/api/payments/payment-intent/route.ts"
  - "repo:apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts"
  - "repo:packages/infrastructure/src/checkout/service.ts"
---

# Content

## Checkout composition

The storefront selects standard or marketplace mode from
`NEXT_PUBLIC_MARKETPLACE_ENABLED`. Standard mode retrieves one Saleor checkout. Marketplace
mode retrieves the unique checkout IDs stored per vendor, loads them in parallel, rejects
invalid or empty checkouts, and derives a combined summary while retaining each real checkout
for mutations and payment.

The checkout page resolves route context, checkout data, access token, and service registry in
parallel. It derives the next incomplete step from email, shipping address, delivery method,
and shipping requirement. User and vendor display information are enrichment; Saleor checkout
IDs remain the transaction boundary.

## Standard payment branch

The storefront payment service initializes the configured Saleor payment gateway and Stripe
transaction through infrastructure. Billing-address mutations and customer attachment happen
before confirmation, and expected failures return domain `Result` values to the UI.

## Marketplace payment branch

1. The storefront posts all sub-checkout IDs, amounts, currency, and optional buyer ID to the
   marketplace payment-intent route.
2. The marketplace rejects duplicate IDs and mixed currencies, computes a deterministic
   idempotency key, and creates one platform PaymentIntent with a transfer group and sub-checkout
   metadata.
3. A Saleor transaction with the PaymentIntent PSP reference is created for each sub-checkout;
   existing references are skipped on retry.
4. After `payment_intent.succeeded`, the signed Stripe webhook records the charged amount for
   each Saleor checkout and completes each checkout into an order.
5. Resulting order IDs are linked to the Stripe charge so ledger settlement can follow Stripe's
   balance availability.

## Invariants

- Marketplace sub-checkouts must use one currency per PaymentIntent.
- Checkout IDs are unique in the payment request.
- PaymentIntent creation and Saleor transaction creation are retry-aware.
- A partial Saleor failure is returned with per-checkout detail rather than hidden.
- Payment success does not directly transfer money to vendors; settlement continues through
  the marketplace ledger and payout flow.

## Failure and recovery

If a webhook finds a checkout transaction already charged, it retries checkout completion
instead of charging again. A Saleor `NOT_FOUND` during completion is treated as a possible
already-completed recovery case. Charge-linking failures are logged and can be recovered by the
order-paid ledger path when it resolves the PaymentIntent from the Saleor order.

# Related Notes

[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
[Stripe Connect Split Payments Solution](product/solution/Stripe%20Connect%20Split%20Payments%20Solution.md)
[Cache and Webhook Invalidation Flow](tech/flows/Cache%20and%20Webhook%20Invalidation%20Flow.md)
