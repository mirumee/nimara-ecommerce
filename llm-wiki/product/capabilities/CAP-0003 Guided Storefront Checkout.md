---
type: "Product Capability"
title: "Guided Storefront Checkout"
description: "The storefront guides guest and authenticated shoppers from valid cart state through contact, fulfillment, billing, payment, and order confirmation."
tags:
  - "capability"
  - "storefront"
  - "checkout"
  - "payments"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
status: "active"
owner: "product-and-engineering"
relations:
  integrations:
    - "[Stripe Payment Application](../integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
    - "[Marketplace Checkout Payment Orchestration](../integrations/INT-0007%20Marketplace%20Checkout%20Payment%20Orchestration.md)"
availability:
  since: "v1.0.0"
  deprecated_since: null
---

# Behavior

The storefront turns valid cart state into a guided sequence. It selects the first incomplete step
from shopper details, shipping address, delivery method, and payment. Products that do not require
shipping skip the shipping and delivery steps. Completed sections remain visible while the shopper
moves forward, and the order summary remains available alongside the forms. Standard mode guides
one checkout; marketplace mode applies the same required details across vendor-specific checkouts.

Guest shoppers can supply an email and addresses during checkout. Authenticated shoppers can reuse
saved addresses and payment methods when the required account and payment configuration is present,
and may save newly entered details for later use. The payment step supports a new Stripe Payment
Element or an existing stored payment method.

In standard mode, the storefront checks fresh payment state, waits while an asynchronous
transaction is still processing, completes the commerce checkout into an order, and navigates to
order confirmation. Marketplace mode instead confirms one payment across the vendor checkouts and
lets the marketplace application complete them asynchronously into separate orders. Successful
navigation clears the completed checkout state from the browser cookie in either mode.

# Actors

- Guest shoppers provide contact, fulfillment, billing, and payment details.
- Authenticated shoppers can additionally reuse and save account-backed addresses and payment
  methods.
- Storefront operators configure the commerce channel, delivery options, and the standard or
  marketplace payment boundary used by the deployment.

# Inputs and outputs

- A valid standard checkout identifier or marketplace vendor-to-checkout mapping in the storefront
  cookie is the entry point.
- Checkout contents and current completion state determine the first open section.
- Shopper email, shipping address, delivery method, billing address, and payment method are gathered
  only when required by the checkout.
- Standard completion produces one commerce order identifier and an order-confirmation route.
  Marketplace completion initiates asynchronous creation of one order per vendor checkout and
  routes the shopper to a generic confirmation.

# Constraints and failure behavior

- Standard checkout uses the installable payment application; marketplace checkout uses a separate
  marketplace payment-orchestration path with non-atomic per-checkout completion semantics.
- Missing or unreadable checkout state redirects the shopper to the cart. Invalid stock or an
  unavailable variant also returns the shopper to the cart with a reason.
- Address, delivery, and payment mutations preserve structured provider errors so the relevant form
  or checkout step can display them.
- Payment processing has no hard client-side timeout. After 30 seconds the storefront warns that
  processing is taking longer than usual and continues polling.
- The standard confirmation view currently acknowledges success but does not render order details
  from its order identifier. Marketplace confirmation does not wait for asynchronous completion or
  prove that every vendor checkout produced an order.
