---
type: "Operational Record"
title: "Marketplace Payment Completion Incident Response"
description: "Incident guidance for a successful marketplace Stripe payment that produces missing, partial, or vendor-invisible commerce orders."
tags:
  - "operations"
  - "incident-response"
  - "marketplace"
  - "payments"
  - "orders"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0005"
status: "active"
owner: "payments-and-marketplace-operations"
kind: "incident_response"
relations:
  implementations: []
  product_records:
    - "[Guided Storefront Checkout](../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
    - "[Marketplace Checkout to Vendor Orders](../product/flows/FLOW-0004%20Marketplace%20Checkout%20to%20Vendor%20Orders.md)"
    - "[Saleor Commerce Backend](../product/integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
    - "[Marketplace Checkout Payment Orchestration](../product/integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md)"
---

# Trigger

Use this record when Stripe shows a successful marketplace PaymentIntent but the shopper sees no
confirmed orders, only some vendor checkouts became orders, vendor users cannot see a created order,
or the Stripe webhook reports signature, metadata, transaction, or checkout-completion failures.

# Preconditions

- Preserve the Stripe event ID, PaymentIntent ID, event delivery history, marketplace deployment
  ref, Saleor domain, checkout IDs and per-checkout amounts from PaymentIntent metadata, and relevant
  application logs. Do not copy secrets or full customer/payment payloads into the incident record.
- Confirm the incident concerns the marketplace payment route, not the separate installable Stripe
  payment application used by standard checkout.
- Restrict new checkout traffic when the same failure is systemic, especially for signature-secret,
  Saleor-configuration, or cross-domain routing faults.
- Obtain read access to Stripe PaymentIntents and webhook deliveries, Saleor checkout transactions
  and orders, marketplace logs, and application configuration.

# Procedure

1. Establish payment truth in Stripe. Confirm mode, amount, currency, final PaymentIntent state,
   charge reference, checkout metadata, commerce domain, and the exact webhook delivery response.
2. Classify the delivery:
   - HTTP 400 indicates a missing or invalid signature or malformed JSON. Check the raw-body path,
     webhook signing secret, endpoint, timestamp tolerance, and clock skew.
   - HTTP 500 after a valid event means every checkout failed or required metadata/configuration was
     missing; Stripe can retry according to its delivery policy.
   - HTTP 200 with a failure payload means at least one checkout succeeded while another failed.
     Stripe will not automatically redeliver solely for the failed subset.
3. For each checkout ID in PaymentIntent metadata, inspect Saleor transactions for the same provider
   reference and determine whether it has an authorized record, a charged amount, an order, or an
   explicit application error.
4. Correlate the per-checkout state with marketplace logs. Distinguish transaction-create failure
   from checkout-completion failure; a browser redirect to generic confirmation proves neither.
5. Before redelivery, verify that every amount and checkout belongs to the same incident. Do not
   create a replacement PaymentIntent or charge while the successful original remains unresolved.
6. Redelivering the same signed `payment_intent.succeeded` event is the supported recovery attempt.
   The handler detects a checkout already charged under the PaymentIntent, skips another charge
   transaction, and retries checkout completion. Observe every checkout result during the replay.
7. For created orders that are absent from vendor views, inspect order vendor metadata and the
   order-created enrichment logs. Repair requires a separately approved metadata reconciliation;
   repeated payment-webhook delivery does not guarantee enrichment.

# Verification

- Every checkout from the PaymentIntent metadata has exactly one charged transaction for that
  provider reference and a completed order, or an explicitly documented unresolved outcome.
- Sum the per-checkout charged amounts and compare currency and total with the PaymentIntent.
- Confirm each order has the intended vendor metadata and appears within the vendor-isolated
  marketplace query. Confirm authenticated customer association only when that workflow applies.
- Verify the final webhook delivery result and preserve per-checkout evidence. A successful replay
  can return an already-processed transaction marker while still producing an order through the
  recovery checkout-completion path.
- Continue to ledger settlement only after payment and order truth are reconciled; ledger or payout
  records cannot repair a missing commerce order.

# Escalation

- The payment webhook has no persisted event inbox and handles checkouts independently. Partial
  success is non-atomic and has no compensating rollback or automatic refund. Escalate any checkout
  still incomplete after controlled redelivery to payments and commerce engineering.
- The browser confirmation route trusts Stripe's redirect status and clears checkout state without
  waiting for asynchronous order completion. Do not use the shopper-facing page as incident
  resolution evidence.
- The order-created enrichment route currently reads but does not verify the Saleor signature.
  Treat unexpected calls or metadata changes as a security incident and restrict delivery at the
  network or application boundary.
- Refund, cancellation, manual order creation, or metadata repair requires explicit business and
  engineering approval. Preserve the original PaymentIntent and checkout evidence before any such
  compensating action.

# Provenance

- This guidance is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [marketplace Stripe webhook](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/payments/stripe/webhooks/route.ts),
  [payment initialization route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/payments/payment-intent/route.ts),
  [browser confirmation boundary](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app/%5Blocale%5D/%28main%29/payment/confirmation/page.tsx),
  and
  [order vendor-enrichment route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/marketplace/src/app/api/saleor/webhooks/order-created/route.ts).
