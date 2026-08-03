---
type: "Integration Contract"
title: "Stripe Payment Application"
description: "Installable Saleor payment application contract for channel-specific Stripe PaymentIntent configuration, transaction webhooks, stored payment methods, and asynchronous status reporting."
tags:
  - "integration"
  - "payments"
  - "stripe"
  - "saleor-app"
  - "stored-payment-methods"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-08-03T00:00:00+00:00"
id: "INT-0005"
status: "active"
owner: "engineering"
availability:
  since: "v1.7.1"
  deprecated_since: null
---

# Purpose

The Stripe application installs into a Saleor deployment with payment-handling and user-management
permission and connects Saleor transactions to Stripe PaymentIntents. Operators configure public
and secret keys per commerce channel. The application exposes the public key to storefront
initialization, creates or updates PaymentIntents for transaction sessions, captures authorized
funds on request, and reports asynchronous Stripe state changes back to the originating Saleor
transaction. It is also the sole owner of the customer's stored payment methods: it holds the
gateway credentials, resolves the gateway customer for a Saleor user, and serves Saleor's stored
payment methods protocol.

# Tenancy

- One deployment serves any number of commerce installations. Each installation is stored under its
  own commerce domain, holding its own installation token, application ID, and per-channel gateway
  keys, and no request can read or write another installation's configuration.
- Every request names its tenant by commerce domain. Both the signing keys used to authenticate the
  caller and the commerce API the application calls back are addressed from that domain, so a
  caller cannot direct the deployment at a server of its own choosing.
- An allowlist of permitted commerce domains gates installation. It accepts a comma-separated list
  with `*` as a wildcard, and defaults to empty. An unconfigured deployment therefore refuses every
  installation and every webhook rather than serving an unknown commerce instance.

# Authentication and permissions

- The manifest requests `HANDLE_PAYMENTS` and `MANAGE_USERS`, and advertises the registration and
  synchronous payment-webhook endpoints. `MANAGE_USERS` is required to read the customer named in a
  payment event and to own the Saleor-user-to-gateway-customer mapping in that user's private
  metadata.
- Registration accepts the installation token and commerce-domain headers, refuses a domain outside
  the allowlist, resolves the installed application ID, and stores the token under that domain.
- Every synchronous Saleor payment webhook rejects a commerce domain outside the allowlist, then
  verifies the signed payload against the signing keys published by that domain. Neither the signing
  keys nor the callback target are taken from a caller-declared API URL: a valid signature proves
  only that the sender controls the commerce instance it names, so trusting a declared issuer would
  let any commerce instance authenticate as an allowed tenant.
- The embedded configuration action verifies the supplied application JWT before changing
  channel-specific keys or replacing Stripe webhook registrations. It verifies against the named
  tenant's keys and ignores the token's own issuer claim, so a token minted by another commerce
  instance cannot be replayed against this tenant.
- Each Stripe webhook verifies `stripe-signature` over the raw request body with the secret assigned
  to its route's channel before reporting an event to Saleor.

# Events and operations

1. `PAYMENT_GATEWAY_INITIALIZE_SESSION` returns the configured Stripe publishable key for the
   checkout channel.
2. `TRANSACTION_INITIALIZE_SESSION` creates a PaymentIntent for the exact checkout or order amount
   and currency. A charge action uses automatic capture; other strategies use manual capture. The
   response includes the client secret and provider-dashboard URL. Event data is not forwarded to
   the provider: the application accepts a stored payment method identifier, a save-for-future-use
   flag, a shared payment token, and extra metadata, and discards everything else. It resolves the
   gateway customer from the Saleor user on the source object — never from caller input — and
   rejects a stored payment method that belongs to a different customer.
3. `TRANSACTION_PROCESS_SESSION` updates an existing PaymentIntent when event data is present or
   retrieves it otherwise, then maps provider state to Saleor's requested action.
4. `TRANSACTION_CHARGE_REQUESTED` captures a manually authorized PaymentIntent and returns a charge
   result when Stripe reaches a terminal charge state.
5. Stripe PaymentIntent and refund webhooks map supported provider events into Saleor transaction
   reports, including available next actions and the provider reference.
6. Channel configuration installs one Stripe webhook endpoint per configured channel and stores its
   provider webhook ID and signing secret with that channel's keys. Replacing endpoints removes only
   those carrying this application, environment, and commerce domain, so installations sharing one
   provider account do not remove each other's endpoints.
7. `LIST_STORED_PAYMENT_METHODS` returns the customer's saved methods for the channel. It reads the
   recorded gateway customer without creating or looking one up, reads the methods in a single call,
   and reports card and wallet methods only. A method is listed only when the provider records an
   explicit redisplay consent against it; methods kept for a single transaction, or stored outside
   this application, are withheld. The default-method flag travels in the free-form `data` object
   because Saleor's stored payment method type has no such field.
8. `STORED_PAYMENT_METHOD_DELETE_REQUESTED` detaches a saved method after confirming it belongs to
   the requesting customer's gateway customer, and answers `SUCCESSFULLY_DELETED` or
   `FAILED_TO_DELETE`.
9. `PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION` ensures a gateway customer exists and opens a
   setup intent for it, answering `ADDITIONAL_ACTION_REQUIRED` with the client secret and
   publishable key the storefront collects the card against.
10. `PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION` reads the setup intent named by the storefront,
    accepts it only when this application created it for this same Saleor user, and maps its state
    onto a tokenization result. A successful result returns the stored method identifier and, when
    the caller asked for it, marks the method as the customer's default.

# Customer identity mapping

- The application stores the gateway customer identifier in the Saleor user's **private** metadata
  under a channel-specific key, and reads no other mapping. Saleor permits a customer to write
  their own public metadata, so the identically named public key that earlier storefront releases
  wrote is shopper-controlled input and is ignored outright.
- A user with no mapping gets a new gateway customer. The application never searches the provider
  for a customer that might already represent that user, so nothing is inherited from an earlier
  integration and no lookup can attach one shopper to another's saved methods.
- Creating a gateway customer uses a provider idempotency key derived from the application,
  commerce domain, channel, and Saleor user, so concurrent events converge on one customer.
- Every transaction for a signed-in shopper is attached to that shopper's gateway customer,
  creating it on first use, so the provider keeps one payment history per shopper. Guest
  transactions carry no customer and therefore cannot keep or reuse a payment method.

# Failure handling and idempotency

- Missing channel configuration returns an unprocessable response before any provider operation.
  Invalid Saleor or Stripe signatures are rejected, and Stripe API errors are converted to error
  responses and logged.
- Provider events lacking the required transaction, commerce-domain, or channel metadata are
  rejected. Events carrying another application issuer, environment, or channel are acknowledged as
  skipped rather than applied to the wrong transaction.
- PaymentIntent creation and capture do not send explicit Stripe idempotency keys, and the
  application does not persist a webhook-event inbox. Duplicate-delivery safety therefore depends
  on the upstream transaction contract and the provider operations rather than a local deduplication
  record.

# Limitations

- `TRANSACTION_CANCELATION_REQUESTED` only retrieves the PaymentIntent and reports
  `CANCEL_SUCCESS` when Stripe already says it is canceled. It does not call Stripe's cancellation
  operation.
- `TRANSACTION_REFUND_REQUESTED` only retrieves the PaymentIntent and reports `REFUND_SUCCESS` when
  that intent is in `succeeded` state. It does not create a Stripe Refund, and an intent being
  succeeded is not evidence that the requested refund occurred.
- Channel configuration and installation tokens are stored through Vercel Edge Config, keyed by
  commerce domain, so a working deployment requires the corresponding Vercel access, team, and
  database configuration. Every installation shares one stored value, which is read, modified, and
  written whole: concurrent configuration saves for different installations are last-write-wins.
- Configuration written before the application became multi-installation is read as a single-entry
  map, so an existing installation keeps working without a migration. The reverse does not hold —
  once a second installation exists, the stored value can no longer be read by application code that
  predates multi-installation support.
- An unconfigured allowlist refuses every installation and webhook. This is deliberate, but it means
  the deployment is inert until an operator names the commerce domains it serves.
- The application handles PaymentIntent-backed Saleor transactions only; it is separate from the
  marketplace's Stripe Connect account and Transfer contract.
- Stored payment methods require a Saleor release that implements the stored payment methods
  protocol, and an installation that was granted `MANAGE_USERS`. Saleor grants permissions at
  install time, so an installation predating this contract keeps only `HANDLE_PAYMENTS` and returns
  no saved methods until it is reinstalled.
- Listing runs as a synchronous webhook on every query of the customer's or checkout's stored
  payment methods, so it sits on the latency path of account and checkout rendering.
- There is no migration path from the storefront-owned integration that preceded this contract.
  Customers carried over from it have no private-metadata mapping and are not matched against the
  provider, so they start with a new gateway customer and an empty saved-method list; methods saved
  under the old integration stay attached to the old customer and are never listed again.
- Methods saved by an integration that did not record a redisplay consent are never listed, even
  when they belong to the mapped customer.
- The provider SDK loaded in the browser decides its own API version. It rejects a caller-supplied
  version outright, so the storefront cannot pin one and the application's server-side version is
  the only one under operator control.
- A session that reports no gateway key or no client secret fails where it is opened, not where
  the SDK is loaded. Consumers of a session treat both as present.

# Provenance

- Availability is anchored in the public
  [`v1.7.1` release snapshot](https://github.com/mirumee/nimara-ecommerce/tree/b500390914b794015e8db37975ce4cbbb27cb6e6),
  which introduces the
  [payment application manifest](https://github.com/mirumee/nimara-ecommerce/blob/b500390914b794015e8db37975ce4cbbb27cb6e6/apps/stripe/src/app/api/saleor/manifest/route.ts),
  [signed Saleor webhook adapter](https://github.com/mirumee/nimara-ecommerce/blob/b500390914b794015e8db37975ce4cbbb27cb6e6/apps/stripe/src/lib/saleor/webhooks/api.ts),
  and
  [signed Stripe event reporter](https://github.com/mirumee/nimara-ecommerce/blob/b500390914b794015e8db37975ce4cbbb27cb6e6/apps/stripe/src/app/api/stripe/%5Bchannel%5D/webhooks/route.ts).
- Current operations and limitations were rechecked at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005)
  in the
  [transaction initialization route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/api/saleor/webhooks/payment/transaction-initialize-session/route.ts),
  [cancellation-request route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/api/saleor/webhooks/payment/transaction-cancelation-requested/route.ts),
  and
  [refund-request route](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/api/saleor/webhooks/payment/transaction-refund-requested/route.ts).
- The stored-payment-method contract, the private-metadata customer mapping, and the
  session-reported gateway key are anchored at exact commit
  [`ebc9e3b8044dc48532d9c32902c584a7589ea6e9`](https://github.com/mirumee/nimara-ecommerce/tree/ebc9e3b8044dc48532d9c32902c584a7589ea6e9)
  in the
  [gateway customer resolver](https://github.com/mirumee/nimara-ecommerce/blob/ebc9e3b8044dc48532d9c32902c584a7589ea6e9/apps/stripe/src/lib/stripe/customer.ts),
  [payment service contract](https://github.com/mirumee/nimara-ecommerce/blob/ebc9e3b8044dc48532d9c32902c584a7589ea6e9/packages/infrastructure/src/payment/types.ts),
  [session initialization](https://github.com/mirumee/nimara-ecommerce/blob/ebc9e3b8044dc48532d9c32902c584a7589ea6e9/packages/infrastructure/src/payment/stripe/infrastructure/payment-initialize-transaction-infra.ts),
  and
  [SDK loader](https://github.com/mirumee/nimara-ecommerce/blob/ebc9e3b8044dc48532d9c32902c584a7589ea6e9/packages/infrastructure/src/payment/stripe/utils.ts).
  That commit is the tip of unmerged branch `feat/saleor-stored-payment-methods`; re-anchor on the
  squash-merge commit once it lands. See
  [IMP-0001 Saleor Stored Payment Methods](../../tech/implementation/IMP-0001%20Saleor%20Stored%20Payment%20Methods.md).
- Multi-installation tenancy, the domain allowlist, the domain-addressed signing keys, and the
  per-installation endpoint cleanup are anchored at exact commit
  [`9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f`](https://github.com/mirumee/nimara-ecommerce/tree/9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f)
  in the
  [runtime configuration schema](https://github.com/mirumee/nimara-ecommerce/blob/9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f/apps/stripe/src/config.ts),
  [tenant resolution](https://github.com/mirumee/nimara-ecommerce/blob/9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f/apps/stripe/src/lib/saleor/config/context.ts),
  [stored configuration provider](https://github.com/mirumee/nimara-ecommerce/blob/9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f/apps/stripe/src/lib/saleor/config/edge.ts),
  [signed webhook adapter](https://github.com/mirumee/nimara-ecommerce/blob/9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f/apps/stripe/src/lib/saleor/webhooks/util.ts),
  and
  [webhook rotation utility](https://github.com/mirumee/nimara-ecommerce/blob/9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f/apps/stripe/src/lib/stripe/webhooks/util.ts).
  That commit is the tip of unmerged branch `feat/saleor-stripe-app-multi-tenant`
  ([PR 741](https://github.com/mirumee/nimara-ecommerce/pull/741)); re-anchor on the squash-merge
  commit once it lands. See
  [IMP-0002 Stripe Payment Application Multi-Tenancy](../../tech/implementation/IMP-0002%20Stripe%20Payment%20Application%20Multi-Tenancy.md).
