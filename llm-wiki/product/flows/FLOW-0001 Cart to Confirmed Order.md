---
type: "Product Flow"
title: "Cart to Confirmed Order"
description: "A standard storefront shopper supplies the required checkout details, confirms payment, and reaches confirmation for a newly created commerce order."
tags:
  - "flow"
  - "storefront"
  - "checkout"
  - "order"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-28T00:00:00+00:00"
id: "FLOW-0001"
status: "active"
owner: "product-engineering-and-qa"
relations:
  capabilities:
    - "[Guided Storefront Checkout](../capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
  integrations:
    - "[Stripe Payment Application](../integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
availability:
  since: "v1.7.1"
  deprecated_since: null
actors:
  - "shopper"
  - "storefront"
  - "commerce backend"
  - "payment application"
  - "payment provider"
---

# Preconditions

- The storefront is using its standard checkout path rather than marketplace mode.
- The shopper's browser has a checkout identifier for a non-empty checkout whose product variants
  remain available and sufficiently stocked.
- The active commerce channel can supply the required countries and delivery methods.
- The Stripe payment application is installed and configured for the active channel. Offering saved
  payment methods additionally requires an authenticated shopper and an installation granted
  user-management permission, because the saved methods are served by the application through the
  commerce backend's stored payment methods protocol.
- The checkout is owned by the shopper who pays for it. A cart created while signed in is attached
  to the customer as it is created, and a guest cart is attached when the shopper signs in. A
  checkout that reaches payment unattached charges as a guest and is offered no saved methods.
  The storefront cannot verify ownership by reading the checkout: the customer field on it is
  permission-gated to staff or the owner, and the storefront reads checkouts anonymously.

# Main flow

1. The shopper proceeds from the cart to checkout. The storefront loads the current checkout and
   opens the first incomplete section.
2. The shopper supplies an email or uses the authenticated account identity. If shipping is
   required, the shopper chooses or enters a shipping address and selects a delivery method.
3. The shopper confirms the billing address and chooses a saved payment method or mounts a new
   Payment Element.
4. The storefront initializes a commerce transaction through the payment application and confirms
   the corresponding PaymentIntent with the payment provider. A saved method is named by its
   provider identifier only; the application resolves the owning provider customer itself and
   refuses a method belonging to anyone else. The browser returns to the storefront
   payment-confirmation route.
5. The confirmation route fetches uncached checkout state. It accepts an already paid checkout or
   processes the returned transaction state; while processing continues, the client polls again.
6. Once payment is successful, the storefront completes the checkout through the commerce backend
   and receives an order identifier.
7. The storefront records the purchase event, navigates to the order-confirmation route, and removes
   the completed checkout cookie.

# Failure paths

- A missing checkout identifier redirects directly to the cart. An unreadable or empty checkout
  also clears the stale identifier before redirecting.
- Insufficient stock or an unavailable variant returns the shopper to the cart with the detected
  reason.
- Contact, address, delivery, billing, and checkout-completion errors remain structured so the
  storefront can show the corresponding error or keep the shopper in checkout.
- Payment initialization or confirmation errors return the shopper to the payment section with a
  payment error. A transaction that remains asynchronous keeps polling and shows a longer-than-usual
  message after 30 seconds.

# Result

The commerce backend has created an order for the paid checkout, the shopper sees an order
confirmation, and the browser no longer carries the completed standard-checkout identifier.
