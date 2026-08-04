---
type: "Product Capability"
title: "Customer Account Self-Service"
description: "Customers can manage authentication, profile data, addresses, orders, returns, saved payment methods, and account deletion from the storefront."
tags:
  - "capability"
  - "storefront"
  - "customer-account"
  - "orders"
  - "privacy"
created: "2026-07-21T00:00:00+00:00"
status: "active"
owner: "product-and-engineering"
relations:
  integrations:
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
    - "[Stripe Payment Application](../integrations/INT-0005%20Stripe%20Payment%20Application.md)"
availability:
  since: "v1.3.0"
  deprecated_since: null
---

# Behavior

Customers can register with a name, email, and password, confirm registration by email, sign in and
out, request a password-reset email, and set a new password from its token. Signed-in customers
receive an account area for order history, saved addresses, profile data, privacy settings, and
saved payment methods.

The profile surface displays and updates the customer's name, requests a confirmed email change,
and changes the password after verifying the current password. Address management lists formatted
addresses with default billing and shipping indicators and supports create, update, delete, and
default selection using country-aware address forms.

Order history shows order status, totals, lines, and previously returned lines. A fulfilled or
partially returned order can submit any still-returnable lines to the backend return operation. The
current form returns each selected fulfillment line's full fulfilled quantity.

The payment-method surface reads, adds, and removes saved methods entirely through the commerce
backend's stored payment methods protocol, authenticated as the customer. The payment application
owns the provider customer and credentials; the storefront never names or creates a provider
customer. Adding a method opens a tokenization session, collects the card in a mounted element,
and completes the session in place — only methods that genuinely redirect leave the page, and they
return to the account surface to finish. The default-method choice is carried into the same
session. Privacy settings start an email-confirmed account-deletion flow; a valid deletion token
removes the backend account, clears the storefront session, and returns the customer to the home
page.

# Actors

- Prospective customers register, confirm their email, and recover credentials.
- Authenticated customers manage their profile, addresses, orders, returns, payment methods, and
  account lifecycle.
- Storefront operators configure the commerce channel, application permissions, email redirects,
  and payment-provider credentials needed by the corresponding operations.

# Inputs and outputs

- Registration and recovery accept customer identity, credentials, channel, and token-bearing
  redirect links and produce a confirmed account or renewed credentials.
- Profile mutations accept names, a verified current password, or a new email and return structured
  backend results.
- Address forms derive fields and validation rules from the selected country and produce saved
  billing or shipping addresses.
- Order queries return the authenticated customer's localized order history; a return submission
  maps selected order lines to fulfillment-line identifiers and quantities.
- Payment-method operations use the authenticated customer's access token and channel to list and
  delete stored methods, and a tokenization session identifier plus the collected card to add one.
- Account deletion uses a request email followed by a confirmation token and produces a logged-out,
  deleted-account state on success.

# Constraints and failure behavior

- Account routes require a valid access token. Missing, expired, or unrefreshable credentials
  redirect the visitor to sign-in and clear unusable authentication cookies.
- Registration, confirmation, credential, profile, address, and deletion operations depend on the
  configured commerce backend and its channel, permissions, and email delivery.
- Order-history query failures currently render the same empty list as an account with no orders.
  Return actions are offered only for fulfilled or partially returned orders and only for lines not
  already represented in a returned fulfillment.
- Return submission is not a partial-quantity interface: selecting a line submits its entire
  fulfilled quantity. The return service also uses the configured privileged application token,
  rather than the customer's access token.
- Saved payment methods require an installed payment application that was granted user-management
  permission, and a commerce release that implements the stored payment methods protocol. An
  installation predating that contract returns no saved methods until it is reinstalled. Listing
  failures still render the same empty list as an account with no saved methods.
- Payment-method state lives with the payment application. The storefront holds no provider
  credentials and cannot reach the provider if the application is unavailable or unconfigured for
  the channel.
- Saved methods belong to one commerce channel. A gateway customer is created per channel, so a
  list read for a different channel than the one the method was saved under is empty rather than
  partial. At checkout the channel comes from the checkout itself, not from the region the URL
  resolves to, because the two can disagree.
- A method is only offered back to the customer when consent to reuse it was recorded as the method
  was stored — adding one from the account area, or ticking save-for-future-use at checkout. A
  method captured any other way stays usable for the payment it was taken for and never appears in
  the saved list.
- Account deletion is a two-step email and token flow. A missing customer session or unsuccessful
  backend deletion leaves the account intact.
