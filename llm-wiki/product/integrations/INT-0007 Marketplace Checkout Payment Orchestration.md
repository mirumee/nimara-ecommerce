---
type: "Integration Contract"
title: "Marketplace Checkout Payment Orchestration"
description: "Marketplace-mode contract for one Stripe PaymentIntent across multiple vendor checkouts, per-checkout Saleor transaction records, and asynchronous checkout completion."
tags:
  - "integration"
  - "marketplace"
  - "checkout"
  - "payments"
  - "stripe"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0007"
status: "active"
owner: "engineering"
availability:
  since: "v2.0.0"
  deprecated_since: null
---

# Purpose

Marketplace storefront mode combines several vendor-specific Saleor checkouts into one customer
payment. The storefront sends the checkout identifiers, gross amounts, currency, and optional buyer
identifier to the marketplace application. The marketplace creates one platform Stripe
PaymentIntent for the sum, records the provider reference against each checkout, and later turns a
signed payment-success event into a charged transaction and checkout-completion attempt for every
checkout.

This is not the installable [Stripe Payment Application](INT-0005%20Stripe%20Payment%20Application.md)
used by standard storefront checkout. It calls Stripe and Saleor from the marketplace application
instead of implementing Saleor's payment-app session webhooks. It is also separate from
[Stripe Connect Vendor Accounts and Transfers](INT-0003%20Stripe%20Connect%20Vendor%20Accounts%20and%20Transfers.md):
this contract captures a platform charge and creates orders, while connected-account Transfers are
later ledger and payout-batch operations.

# Authentication and permissions

- The storefront server action calls `POST /api/payments/payment-intent` on the configured
  marketplace origin with an `x-saleor-domain` routing header and a JSON checkout list.
- The route resolves an installed marketplace app configuration for that commerce domain. It uses
  the server-side Stripe secret and the app-backed GraphQL boundary to read and create checkout
  transactions; provider and app credentials are not returned to the storefront.
- The initialization endpoint does not authenticate or sign the storefront request, authorize the
  supplied checkout identifiers, or verify the optional buyer identifier. The domain header selects
  configuration but is not caller authentication.
- Stripe webhook processing requires `stripe-signature` over the raw body. Verification uses the
  marketplace payment webhook secret, timing-safe HMAC comparison, and a five-minute timestamp
  tolerance before event data is accepted.

# Events and operations

1. Initialization rejects an empty list, duplicate checkout identifiers, non-positive amounts,
   malformed currencies, and a batch containing more than one currency.
2. The marketplace creates one automatic-payment-method PaymentIntent for the sum of the supplied
   amounts. Metadata records the checkout identifiers, per-checkout amounts, commerce domain,
   optional buyer identifier, and separate-charges-and-transfers model.
3. For each checkout that does not already contain the PaymentIntent provider reference, the route
   creates an authorized Saleor transaction named `PaymentIntent created`. The response exposes the
   client secret plus per-checkout initialization status.
4. The storefront mounts Stripe Payment Element with that client secret and confirms the
   PaymentIntent. It then follows Stripe's redirect to the marketplace confirmation path.
5. A signed `payment_intent.succeeded` event creates a charged Saleor transaction for each checkout
   that is not already charged, completes that checkout into an order, and best-effort links returned
   order identifiers to the Stripe charge for later ledger reconciliation.
6. Other Stripe event types are acknowledged without changing checkout or order state.

# Failure handling and idempotency

- PaymentIntent creation uses a deterministic provider idempotency key derived from the sorted
  checkout identifiers, amounts, and currencies. Initialization also checks each checkout for the
  same provider reference before creating another transaction.
- Webhook replay checks whether a transaction with the PaymentIntent reference already has a charged
  amount. When it does, processing skips another charge record and retries checkout completion. A
  checkout-complete `NOT_FOUND` response is treated as an already-completed recovery case.
- There is no persisted Stripe webhook-event inbox. Replay safety depends on the checkout transaction
  state and provider reference rather than event-ID deduplication.
- Initialization can return HTTP 200 and a usable client secret when transaction creation failed for
  one or more checkouts; the response includes `checkoutStatuses`, `failedTransactionCreates`, and
  `hasFailures` for diagnostics.
- Webhook processing is per checkout, not transactional across the batch. If every checkout fails it
  returns a server error so Stripe can retry. If at least one succeeds, a partial failure is returned
  with HTTP 200, so the provider will not automatically redeliver solely for the failed checkouts.
- Linking completed orders to the Stripe charge is best effort. A linking error is logged after the
  orders are created and does not fail the webhook response.

# Limitations

- The initialization endpoint trusts caller-supplied checkout identifiers and amounts. It does not
  re-read checkout totals before creating the PaymentIntent or prove that the caller owns those
  checkouts. Deployments must protect this route at the network or application boundary until an
  authenticated, server-to-server request contract and server-side total validation are added.
- The provider idempotency key excludes the buyer and commerce domain. Deployments that share one
  Stripe account across commerce domains can collide if those domains produce identical checkout
  identifiers, amounts, and currencies.
- One Stripe charge covers all vendor checkouts, but Saleor transaction recording and checkout
  completion are independent operations. A successful charge can therefore leave only a subset of
  checkouts completed, with no compensating rollback of the charge or completed orders.
- A successful Stripe redirect is enough for the storefront to show its generic marketplace order
  confirmation. That page does not wait for the webhook, fetch created order identifiers, or verify
  that every checkout completed.
- The storefront payment-service loader still requires the public Stripe key and payment-application
  identifier even though marketplace initialization bypasses the installable payment application's
  transaction-session route.
- The two marketplace payment routes do not currently have scoped automated tests. Existing payment
  application and Stripe Connect tests do not exercise this orchestration contract.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9),
  which contains the
  [marketplace PaymentIntent endpoint](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/api/payments/payment-intent/route.ts),
  [signed Stripe completion webhook](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts),
  and
  [storefront marketplace payment adapter](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/foundation/checkout/sections/payment/actions.ts)
  described above.
- Current failure and confirmation boundaries were rechecked at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005)
  in the
  [payment UI](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/foundation/checkout/sections/payment/payment.tsx)
  and
  [marketplace confirmation route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app/%5Blocale%5D/%28main%29/payment/confirmation/page.tsx).
