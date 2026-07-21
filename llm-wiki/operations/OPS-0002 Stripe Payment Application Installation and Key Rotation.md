---
type: "Operational Record"
title: "Stripe Payment Application Installation and Key Rotation"
description: "Runbook for installing the TypeScript Stripe payment application, configuring channel keys, rotating its Stripe webhooks, and verifying standard checkout."
tags:
  - "operations"
  - "payments"
  - "stripe"
  - "saleor-app"
  - "key-rotation"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
id: "OPS-0002"
status: "active"
owner: "payments-engineering"
kind: "runbook"
relations:
  implementations: []
  product_records:
    - "[Guided Storefront Checkout](../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
    - "[Cart to Confirmed Order](../product/flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md)"
    - "[Stripe Payment Application](../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
---

# Trigger

Use this runbook when deploying and installing the repository's TypeScript Stripe application,
adding a Saleor channel, changing Stripe public or secret keys, or recovering missing Stripe
webhook subscriptions for standard storefront checkout.

# Preconditions

- Use separate Stripe test and live credentials and confirm which mode the Saleor environment and
  channel should use.
- Deploy `apps/stripe` at a stable HTTPS origin. Localhost can serve the application but the code
  deliberately skips Stripe webhook installation for local origins.
- Configure the Saleor API URL, `NEXT_PUBLIC_ENVIRONMENT`, Vercel team/access/Edge Config values,
  and a stable `CONFIG_KEY`. The runtime schema requires Vercel access and team values even though
  the current application `.env.example` does not list all of them and uses the older `ENVIRONMENT`
  name. Validate against `apps/stripe/src/config.ts`, not the example file alone.
- The application persists installation tokens, channel keys, webhook IDs, and webhook secrets in
  Vercel Edge Config.
- Confirm access to the Saleor Extensions UI, the Stripe webhook dashboard, Vercel logs, and a
  low-risk checkout in the target channel.
- Record the current application ID, channel configuration, webhook endpoint IDs, and previous key
  identifiers before rotating anything. Never record secret values in the wiki or an incident log.

# Procedure

1. Verify `GET /api/saleor/manifest` returns the expected application ID, version, `HANDLE_PAYMENTS`
   permission, registration URL, application URL, and all advertised synchronous transaction
   webhooks.
2. Install the application from that manifest in the intended Saleor environment. Registration
   stores the installation token and application ID for the Saleor domain and refreshes signing
   keys.
3. Open the installed application from Saleor so its signed application context can load the
   configuration form. Configure the Stripe public and secret key for each channel.
4. Save once. The save action verifies the Saleor JWT, removes Stripe webhook endpoints created by
   the same application issuer and environment, creates one new channel-specific endpoint, records
   its signing secret, and then persists the updated channel configuration.
5. Set the storefront's `NEXT_PUBLIC_PAYMENT_APP_ID` to the installed application ID and supply the
   storefront payment keys required by its checkout configuration. Rebuild and deploy the
   storefront because the public application ID is build-time configuration.
6. During key rotation, keep the prior credentials available until a new webhook endpoint and a
   successful test transaction are verified. Rotate one environment at a time; never mix test and
   live keys across the public and secret halves.

# Verification

- Reload the embedded configuration and confirm each expected Saleor channel has the correct
  currency and masked key state.
- In Stripe, verify exactly one intended endpoint per channel and environment at
  `/api/stripe/{channel}/webhooks`, with the PaymentIntent and refund events selected by the app.
- Run a low-value test checkout. Verify gateway initialization returns the public key, transaction
  initialization creates a PaymentIntent, the Stripe event is accepted, Saleor transaction state
  advances, and the storefront reaches a real order confirmation.
- Confirm invalid Saleor and Stripe signatures are rejected and that logs contain the Saleor domain,
  channel, event type, and provider reference without exposing secrets.

# Escalation

- Saving configuration is not atomic: the action removes matching old endpoints before installing
  replacements, and it persists Edge Config only after webhook work. If installation fails, stop
  checkout traffic, inspect Stripe and Vercel state, and restore a known-good channel configuration
  rather than repeatedly saving blind.
- A secret-key change to another Stripe account cannot remove endpoints from the former account;
  inspect and retire those endpoints explicitly after the new account is verified.
- Roll back a rotation by restoring still-valid prior keys through the signed application form,
  saving once, and verifying the newly re-created endpoint before re-enabling checkout. If the old
  secret has already been revoked, issue a fresh key pair instead of restoring it.
- Do not treat the advertised cancellation and refund routes as operational cancellation/refund
  controls. The current handlers inspect PaymentIntent state but do not initiate cancellation or a
  Stripe Refund; perform and reconcile those actions through an approved external procedure.
- Escalate missing Edge Config state, cross-channel webhook delivery, mixed live/test mode, or any
  rotation that leaves both old and new endpoints active unexpectedly.

# Provenance

- This procedure is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [application manifest](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/api/saleor/manifest/route.ts),
  [installation handler](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/api/saleor/register/route.ts),
  [runtime configuration schema](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/config.ts),
  [configuration save action](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/app/app/actions/save-data-action.tsx),
  and
  [webhook rotation utility](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/apps/stripe/src/lib/stripe/webhooks/util.ts).
