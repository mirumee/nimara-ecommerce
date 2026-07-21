---
type: "Product Flow"
title: "Marketplace Checkout to Vendor Orders"
description: "A shopper pays once for an aggregated marketplace cart while vendor-specific Saleor checkouts complete asynchronously into separate orders."
tags:
  - "flow"
  - "marketplace"
  - "checkout"
  - "orders"
  - "payments"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "FLOW-0004"
status: "active"
owner: "product-engineering-and-qa"
relations:
  capabilities:
    - "[Guided Storefront Checkout](../capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
    - "[Marketplace Vendor Operations](../capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md)"
  integrations:
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
    - "[Marketplace Checkout Payment Orchestration](../integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md)"
availability:
  since: "v2.0.0"
  deprecated_since: null
actors:
  - "shopper"
  - "storefront"
  - "marketplace payment orchestrator"
  - "Saleor commerce backend"
  - "Stripe"
  - "vendor"
---

# Preconditions

- Marketplace mode is enabled and the storefront can reach the configured marketplace origin.
- The storefront and marketplace application target the same installed Saleor domain. The
  marketplace has its app configuration, Stripe secret, payment-webhook signing secret, and public
  route configured.
- Storefront payment configuration supplies the Stripe public key and the payment-service loader's
  required application identifier.
- Products that belong to vendors carry vendor-profile identifiers, allowing the storefront to
  maintain a separate checkout for each vendor represented in the cart.
- Every checkout is valid, uses the same currency as the others, and has all required contact,
  address, and delivery data before payment begins.

# Main flow

1. When the shopper adds a variant, the storefront uses the product's vendor identifier as the cart
   key. Items for the same vendor share a Saleor checkout; items from another vendor create or reuse
   a different checkout. The HTTP-only checkout cookie stores the vendor-to-checkout mapping.
2. Cart and checkout pages retrieve the mapped checkouts, remove empty or unreadable entries, verify
   line availability, and aggregate lines and money for presentation. The guided checkout applies
   required email, address, and delivery choices to the underlying checkouts while presenting one
   customer journey.
3. At payment, the storefront sends every checkout identifier, gross total, currency, and optional
   buyer identifier through
   [Marketplace Checkout Payment Orchestration](../integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md).
   The marketplace creates one Stripe PaymentIntent and associates its provider reference with the
   individual Saleor checkouts.
4. The shopper confirms the single payment in Stripe Payment Element. Stripe redirects the browser
   to the storefront and independently sends a signed `payment_intent.succeeded` event to the
   marketplace application.
5. For each checkout, the signed webhook records the charged amount and invokes Saleor checkout
   completion. Successful completions create separate order identifiers and are best-effort linked
   to the common Stripe charge.
6. Saleor's asynchronous order-created event copies the vendor identifier from an order line's
   product metadata onto the order. For an authenticated buyer it also adds the customer identifier
   to the vendor profile, making the order and customer discoverable through the vendor-filtered
   marketplace workspace.
7. When Stripe's browser redirect reports success, the storefront routes to a generic marketplace
   confirmation and clears the checkout cookie. This browser branch does not wait for steps 5 or 6
   to finish.

# Failure paths

- If no valid checkouts remain, or any checkout contains insufficient stock or an unavailable
  variant, the storefront clears or rejects the affected state and returns the shopper to the cart.
- Mixed currencies, invalid request data, missing marketplace configuration, or PaymentIntent
  creation failure stop payment initialization. The storefront currently surfaces a generic payment
  error rather than per-checkout diagnostics.
- Per-checkout transaction initialization can partially fail while the endpoint still returns a
  client secret. The shopper can therefore confirm the shared PaymentIntent despite one checkout's
  initialization error.
- After the charge succeeds, transaction recording and checkout completion can succeed for only a
  subset of checkouts. A partial-success webhook response is HTTP 200, so no automatic provider
  retry is guaranteed for the failed subset. There is no cross-checkout rollback or automatic
  refund.
- The browser confirmation trusts Stripe's redirect status and does not display the created order
  identifiers. It can clear the checkout cookie before all backend order completion work succeeds.
- The order-created handler currently reads the Saleor signature header but does not verify it. A
  failed or untrusted enrichment call can leave an otherwise created order without vendor metadata;
  vendor order lists filter on that metadata, so the order may not appear in the vendor workspace.
- No scoped automated test currently exercises the multi-checkout payment and asynchronous
  completion path end to end.

# Result

When every asynchronous step succeeds, one customer payment produces one Saleor order for each
vendor-specific checkout. Each order is tagged for the responsible vendor and an authenticated
buyer is associated with that vendor for marketplace customer visibility. The storefront shows a
generic marketplace confirmation rather than the individual order identifiers.

This flow stops at vendor-visible commerce orders and their shared Stripe charge reference. It does
not ingest payable ledger lines, close a payout batch, create a Stripe Connect Transfer, or confirm a
vendor bank payout; those are later settlement operations.

# Provenance

- Availability is anchored in the public
  [`v2.0.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/1fd1a16558bac1cfebd9a2356ff79061f8627da9),
  which contains the
  [vendor-keyed checkout state](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/features/checkout/server.ts),
  [aggregated marketplace checkout page](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/storefront/src/app/%5Blocale%5D/%28checkout%29/checkout/page.tsx),
  [payment-success completion webhook](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts),
  and
  [order vendor-enrichment webhook](https://github.com/mirumee/nimara-ecommerce/blob/1fd1a16558bac1cfebd9a2356ff79061f8627da9/apps/marketplace/src/app/api/saleor/webhooks/order-created/route.ts).
- Current asynchronous boundaries were rechecked at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005)
  in the
  [marketplace confirmation route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app/%5Blocale%5D/%28main%29/payment/confirmation/page.tsx)
  and
  [vendor-filtered order query](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/lib/graphql/server/schema.ts).
