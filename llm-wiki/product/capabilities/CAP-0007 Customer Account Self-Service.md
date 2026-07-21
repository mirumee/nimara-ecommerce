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
timestamp: "2026-07-21T00:00:00+00:00"
id: "CAP-0007"
status: "active"
owner: "product-and-engineering"
relations:
  integrations:
    - "[Saleor Commerce Backend](../integrations/INT-0006%20Saleor%20Commerce%20Backend.md)"
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

When privileged backend and payment-provider configuration is present, the payment-method surface
finds or creates the customer's payment-provider record, lists saved methods, adds a method through
a setup flow, chooses the resulting default method, and removes a method after validating its
ownership. Privacy settings start an email-confirmed account-deletion flow; a valid deletion token
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
- Payment-method operations use the authenticated customer, channel, environment, customer
  metadata, and provider setup result to produce a saved-method list.
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
- Saved payment methods require the privileged commerce application token plus valid payment
  service credentials. Without the application token the page remains available but cannot create
  a provider customer or add methods; provider-list failures currently appear as an empty list.
- Payment-method state is split between provider customer data and a channel-specific customer
  metadata reference in the commerce backend; either side being unavailable prevents reliable
  self-service.
- Account deletion is a two-step email and token flow. A missing customer session or unsuccessful
  backend deletion leaves the account intact.

# Provenance

- Availability is anchored in the public
  [`v1.3.0` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/5d29850c4dfc8e4225409ca741dc9437db88cf78),
  the first release where the existing account, profile, address, payment-method, privacy, and
  order-history surfaces also include the
  [customer return action](https://github.com/mirumee/nimara-ecommerce/blob/5d29850c4dfc8e4225409ca741dc9437db88cf78/apps/storefront/src/app/%5Blocale%5D/%28main%29/account/orders/_forms/actions.ts)
  and
  [return interface](https://github.com/mirumee/nimara-ecommerce/blob/5d29850c4dfc8e4225409ca741dc9437db88cf78/apps/storefront/src/app/%5Blocale%5D/%28main%29/account/orders/_components/return-products-modal.tsx).
- Current behavior and limitations were rechecked at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005)
  in the
  [account navigation](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/features/account/account-menu/side-links.tsx),
  [profile actions](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app/%5Blocale%5D/%28main%29/account/profile/_forms/actions.ts),
  [order-history page](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app/%5Blocale%5D/%28main%29/account/orders/page.tsx),
  and
  [payment-method page](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/storefront/src/app/%5Blocale%5D/%28main%29/account/payment-methods/page.tsx).
