---
type: "Integration Contract"
title: "Stripe Payment Application"
description: "Installable Saleor payment application contract for channel-specific Stripe PaymentIntent configuration, transaction webhooks, and asynchronous status reporting."
tags:
  - "integration"
  - "payments"
  - "stripe"
  - "saleor-app"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "INT-0005"
status: "active"
owner: "engineering"
availability:
  since: "v1.7.1"
  deprecated_since: null
---

# Purpose

The Stripe application installs into a Saleor deployment with payment-handling permission and
connects Saleor transactions to Stripe PaymentIntents. Operators configure public and secret keys
per commerce channel. The application exposes the public key to storefront initialization, creates
or updates PaymentIntents for transaction sessions, captures authorized funds on request, and
reports asynchronous Stripe state changes back to the originating Saleor transaction.

# Authentication and permissions

- The manifest requests only the `HANDLE_PAYMENTS` permission and advertises the registration and
  synchronous payment-webhook endpoints.
- Registration accepts the installation token and commerce-domain headers, resolves the installed
  application ID, stores the token in the domain-specific configuration, and primes the signing-key
  provider.
- Every synchronous Saleor payment webhook verifies the signed payload against the signing keys for
  the declared API issuer before processing its event.
- The embedded configuration action verifies the supplied application JWT before changing
  channel-specific keys or replacing Stripe webhook registrations.
- Each Stripe webhook verifies `stripe-signature` over the raw request body with the secret assigned
  to its route's channel before reporting an event to Saleor.

# Events and operations

1. `PAYMENT_GATEWAY_INITIALIZE_SESSION` returns the configured Stripe publishable key for the
   checkout channel.
2. `TRANSACTION_INITIALIZE_SESSION` creates a PaymentIntent for the exact checkout or order amount
   and currency. A charge action uses automatic capture; other strategies use manual capture. The
   response includes the client secret and provider-dashboard URL.
3. `TRANSACTION_PROCESS_SESSION` updates an existing PaymentIntent when event data is present or
   retrieves it otherwise, then maps provider state to Saleor's requested action.
4. `TRANSACTION_CHARGE_REQUESTED` captures a manually authorized PaymentIntent and returns a charge
   result when Stripe reaches a terminal charge state.
5. Stripe PaymentIntent and refund webhooks map supported provider events into Saleor transaction
   reports, including available next actions and the provider reference.
6. Channel configuration installs one Stripe webhook endpoint per configured channel and stores its
   provider webhook ID and signing secret with that channel's keys.

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
- Channel configuration and installation tokens are stored through Vercel Edge Config, so a working
  deployment requires the corresponding Vercel access, team, and database configuration.
- The application handles PaymentIntent-backed Saleor transactions only; it is separate from the
  marketplace's Stripe Connect account and Transfer contract.

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
