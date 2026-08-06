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
timestamp: "2026-08-04T00:00:00+00:00"
id: "OPS-0002"
status: "active"
owner: "payments-engineering"
kind: "runbook"
relations:
  implementations:
    - "[Saleor Stored Payment Methods](../tech/implementation/IMP-0001%20Saleor%20Stored%20Payment%20Methods.md)"
    - "[Stripe Payment Application Multi-Tenancy](../tech/implementation/IMP-0002%20Stripe%20Payment%20Application%20Multi-Tenancy.md)"
    - "[Payment Application Configuration Storage Selection](../tech/implementation/IMP-0003%20Payment%20Application%20Configuration%20Storage%20Selection.md)"
  product_records:
    - "[Guided Storefront Checkout](../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
    - "[Cart to Confirmed Order](../product/flows/FLOW-0001%20Cart%20to%20Confirmed%20Order.md)"
    - "[Stripe Payment Application](../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
---

# Trigger

Use this runbook when deploying and installing the repository's TypeScript Stripe application,
adding a Saleor channel, changing Stripe public or secret keys, recovering missing Stripe webhook
subscriptions for standard storefront checkout, or reinstalling the application after its
requested permissions change.

# Preconditions

- Use separate Stripe test and live credentials and confirm which mode the Saleor environment and
  channel should use.
- Deploy `apps/stripe` at a stable HTTPS origin. Localhost can serve the application but the code
  deliberately skips Stripe webhook installation for local origins.
- Set `ALLOWED_DOMAINS` to the Saleor domains this deployment serves, as a comma-separated list
  where `*` is a wildcard, for example `nimara-*.eu.saleor.cloud,demo.nimara.store`. It has no
  default and the application fails closed: with it unset, every installation and every webhook is
  refused, including installations that already exist. Set it before deploying, not after.
- Configure `NEXT_PUBLIC_ENVIRONMENT` and a stable `CONFIG_KEY`, and leave `CONFIG_PROVIDER` at its
  default `edge` so the deployment stores configuration in the hosted Edge Config. That selection
  requires the Vercel team, access, and Edge Config database values; the runtime schema demands all
  three whenever `edge` is selected and fails at startup naming the one that is missing.
- Never set `CONFIG_PROVIDER=file` on a deployment. That backend keeps the configuration of every
  installation in a JSON file next to the application and exists for developer machines only. On a
  serverless deployment the filesystem is per-instance and does not survive, so installations appear
  to succeed and then vanish, and the file would hold installation tokens and provider secret keys
  as readable text. The application does not refuse the selection.
- Do not configure a Saleor API URL for the running application. It no longer reads one: each
  request names its own Saleor domain, and `NEXT_PUBLIC_SALEOR_API_URL` now only feeds code
  generation.
- The application persists installation tokens, channel keys, webhook IDs, and webhook secrets in the
  selected storage backend, keyed by Saleor domain. One deployment serves many Saleor installations,
  and all of them share a single stored value regardless of which backend holds it.
- Confirm access to the Saleor Extensions UI, the Stripe webhook dashboard, Vercel logs, and a
  low-risk checkout in the target channel.
- Record the current application ID, channel configuration, webhook endpoint IDs, and previous key
  identifiers before rotating anything. Never record secret values in the wiki or an incident log.

# Procedure

1. Verify `GET /api/saleor/manifest` returns the expected application ID, version, the
   `HANDLE_PAYMENTS` and `MANAGE_USERS` permissions, registration URL, application URL, and all
   advertised synchronous transaction and stored-payment-method webhooks.
2. Install the application from that manifest in the intended Saleor environment. Registration
   stores the installation token and application ID for the Saleor domain and refreshes signing
   keys. A domain outside `ALLOWED_DOMAINS` is refused with a message naming the domain, or naming
   the `ALLOWED_DOMAINS` setting itself when nothing is allowlisted; correct the setting and
   redeploy before retrying, because it is read at startup.
3. Compare the granted permissions of an existing installation against the manifest. Saleor grants
   permissions at install time and does not widen them when a manifest changes, so an installation
   that predates the stored-payment-method contract holds only `HANDLE_PAYMENTS` and silently
   returns no saved methods. Reinstall it to pick up `MANAGE_USERS`, then reconfigure channel keys,
   because reinstallation issues a new installation token and application ID.
4. Open the installed application from Saleor so its signed application context can load the
   configuration form. Configure the Stripe public and secret key for each channel.
5. Save once. The save action verifies the Saleor JWT, removes Stripe webhook endpoints created by
   the same application issuer, environment, and Saleor domain, creates one new endpoint per
   distinct Stripe secret key, records its signing secret against every channel using that key, and
   then persists the updated channel configuration. Channels sharing a key share one endpoint, so
   the endpoint count follows Stripe accounts rather than channels. Endpoints belonging to another
   Saleor domain are left alone, so two installations may share one Stripe account. Avoid saving
   configuration for two installations at the same moment: all installations share one stored value
   and the later write wins.
6. Set the storefront's `NEXT_PUBLIC_PAYMENT_APP_ID` to the installed application ID and supply the
   storefront payment keys required by its checkout configuration. Rebuild and deploy the
   storefront because the public application ID is build-time configuration.
7. During key rotation, keep the prior credentials available until a new webhook endpoint and a
   successful test transaction are verified. Rotate one environment at a time; never mix test and
   live keys across the public and secret halves.

# Verification

- Reload the embedded configuration and confirm each expected Saleor channel has the correct
  currency and masked key state.
- In Stripe, verify exactly one intended endpoint per account and environment at
  `/api/stripe/webhooks/{saleor-domain}`, with the PaymentIntent and refund events selected by the
  app. Channels sharing a secret key share that endpoint; a leftover endpoint addressed per channel
  belongs to a release before this one and should be retired.
- Run a low-value test checkout. Verify gateway initialization returns the public key, transaction
  initialization creates a PaymentIntent, the Stripe event is accepted, Saleor transaction state
  advances, and the storefront reaches a real order confirmation.
- Confirm invalid Saleor and Stripe signatures are rejected and that logs contain the Saleor domain,
  channel, event type, and provider reference without exposing secrets.
- On a deployment serving more than one Saleor installation, confirm each installation still resolves
  its own channel keys and that a configuration save for one leaves the other's channel keys and
  Stripe endpoints untouched.
- As a signed-in customer, add a card from the account area and confirm it appears in the saved
  list and at checkout. An empty list after a successful save usually means the installation was
  never granted `MANAGE_USERS`.
- On an environment upgraded from a storefront-owned Stripe integration, expect existing customers
  to have no saved cards at all and to be issued a new provider customer on their next payment or
  card save. This is the intended upgrade behaviour, not an incident: the old mapping lived in
  shopper-writable metadata and is deliberately not honoured. Tell support in advance that carried
  over shoppers re-enter their card once.

# Escalation

- Saving configuration is not atomic: the action removes matching old endpoints before installing
  replacements, and it persists the stored configuration only after webhook work. If installation fails, stop
  checkout traffic, inspect Stripe and Vercel state, and restore a known-good channel configuration
  rather than repeatedly saving blind.
- A secret-key change to another Stripe account cannot remove endpoints from the former account;
  inspect and retire those endpoints explicitly after the new account is verified.
- Endpoints registered before the endpoint address changed still point at the per-channel address
  and answer 404. Saving configuration once per installation replaces them. Until that is done the
  provider retries and transaction reports do not arrive, so plan the re-save with the release
  rather than after an incident.
- Two installations sharing one Stripe account each receive the other's events, and each
  acknowledges what is not addressed to it. Deliveries recorded as succeeded on both endpoints are
  therefore expected, and are not evidence of double processing.
- Roll back a rotation by restoring still-valid prior keys through the signed application form,
  saving once, and verifying the newly re-created endpoint before re-enabling checkout. If the old
  secret has already been revoked, issue a fresh key pair instead of restoring it.
- Do not treat the advertised cancellation and refund routes as operational cancellation/refund
  controls. The current handlers inspect PaymentIntent state but do not initiate cancellation or a
  Stripe Refund; perform and reconcile those actions through an approved external procedure.
- A deployment that refuses every installation and webhook at once is normally an unset or
  mistyped `ALLOWED_DOMAINS`, not a Saleor or Stripe fault. Check it before touching keys or
  reinstalling, and remember a wildcard pattern must cover the whole domain, including its region
  segment.
- Rolling the application back to a release that predates multi-installation support is safe only
  while exactly one Saleor installation exists. With two or more installed, the stored configuration
  cannot be read by the older code; remove the additional installations from the stored value first,
  or roll forward instead.
- Installations that succeed and are then repeatedly missing, with no configuration to load and no
  rejected write in the logs, indicate a deployment running the on-disk backend. Confirm
  `CONFIG_PROVIDER`, move it back to `edge` with the Vercel values in place, and reinstall and
  reconfigure every affected installation: nothing written to the ephemeral filesystem is
  recoverable, including the installation tokens and webhook secrets.
- A rejected read or write against the hosted store, reported as a forbidden response while the
  application starts normally, is a Vercel access, team, or database mismatch rather than a Saleor or
  Stripe fault. All three values must belong to the same Vercel team as the Edge Config they name.
- Escalate missing configuration state in the hosted store, cross-channel webhook delivery, mixed
  live/test mode, or any rotation that leaves both old and new endpoints active unexpectedly.

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
- The stored-payment-method reinstallation step is anchored at exact commit
  [`ebc9e3b8044dc48532d9c32902c584a7589ea6e9`](https://github.com/mirumee/nimara-ecommerce/tree/ebc9e3b8044dc48532d9c32902c584a7589ea6e9)
  in the
  [application manifest](https://github.com/mirumee/nimara-ecommerce/blob/ebc9e3b8044dc48532d9c32902c584a7589ea6e9/apps/stripe/src/app/api/saleor/manifest/route.ts).
  That commit is the tip of unmerged branch `feat/saleor-stored-payment-methods`; re-anchor on the
  squash-merge commit once it lands.
- The allowlist precondition, the refused-installation step, the domain-scoped endpoint replacement,
  and the rollback constraint are anchored at exact commit
  [`e0dee7b3baf55684917217e69533964bb0bbb499`](https://github.com/mirumee/nimara-ecommerce/tree/e0dee7b3baf55684917217e69533964bb0bbb499)
  in the
  [runtime configuration schema](https://github.com/mirumee/nimara-ecommerce/blob/e0dee7b3baf55684917217e69533964bb0bbb499/apps/stripe/src/config.ts),
  [installation handler](https://github.com/mirumee/nimara-ecommerce/blob/e0dee7b3baf55684917217e69533964bb0bbb499/apps/stripe/src/app/api/saleor/register/route.ts),
  [tenant resolution](https://github.com/mirumee/nimara-ecommerce/blob/e0dee7b3baf55684917217e69533964bb0bbb499/apps/stripe/src/lib/saleor/config/context.ts),
  [stored configuration provider](https://github.com/mirumee/nimara-ecommerce/blob/e0dee7b3baf55684917217e69533964bb0bbb499/apps/stripe/src/lib/saleor/config/edge.ts),
  [configuration save action](https://github.com/mirumee/nimara-ecommerce/blob/e0dee7b3baf55684917217e69533964bb0bbb499/apps/stripe/src/app/app/actions/save-data-action.tsx),
  and
  [webhook rotation utility](https://github.com/mirumee/nimara-ecommerce/blob/e0dee7b3baf55684917217e69533964bb0bbb499/apps/stripe/src/lib/stripe/webhooks/util.ts).
  That commit is the squash-merge of
  [PR 741](https://github.com/mirumee/nimara-ecommerce/pull/741) on `main`.
- The endpoint-per-account arrangement, the endpoint address carrying the Saleor domain, the re-save
  required to retire per-channel endpoints, and the shared-account acknowledgement behaviour are
  anchored at exact commit
  [`46b0c275332d5abd58d773cfc70ee2933020fa75`](https://github.com/mirumee/nimara-ecommerce/tree/46b0c275332d5abd58d773cfc70ee2933020fa75)
  in the
  [signed provider event reporter](https://github.com/mirumee/nimara-ecommerce/blob/46b0c275332d5abd58d773cfc70ee2933020fa75/apps/stripe/src/app/api/stripe/webhooks/%5BsaleorDomain%5D/route.ts),
  [webhook rotation utility](https://github.com/mirumee/nimara-ecommerce/blob/46b0c275332d5abd58d773cfc70ee2933020fa75/apps/stripe/src/lib/stripe/webhooks/util.ts),
  [endpoint address helper](https://github.com/mirumee/nimara-ecommerce/blob/46b0c275332d5abd58d773cfc70ee2933020fa75/apps/stripe/src/lib/stripe/const.ts),
  and
  [configuration save action](https://github.com/mirumee/nimara-ecommerce/blob/46b0c275332d5abd58d773cfc70ee2933020fa75/apps/stripe/src/app/app/actions/save-data-action.tsx).
  That commit is the squash-merge of
  [PR 743](https://github.com/mirumee/nimara-ecommerce/pull/743) on `main`.
- The storage selection, the deployment prohibition on the on-disk backend, and the startup failure
  naming a missing hosted-store value are anchored at exact commit
  [`2680feabd8fc0cc5efdd680a2d78fed778c6ed8b`](https://github.com/mirumee/nimara-ecommerce/tree/2680feabd8fc0cc5efdd680a2d78fed778c6ed8b)
  in the
  [runtime configuration schema](https://github.com/mirumee/nimara-ecommerce/blob/2680feabd8fc0cc5efdd680a2d78fed778c6ed8b/apps/stripe/src/config.ts),
  [storage selection](https://github.com/mirumee/nimara-ecommerce/blob/2680feabd8fc0cc5efdd680a2d78fed778c6ed8b/apps/stripe/src/providers/config.ts),
  and
  [on-disk configuration backend](https://github.com/mirumee/nimara-ecommerce/blob/2680feabd8fc0cc5efdd680a2d78fed778c6ed8b/apps/stripe/src/lib/saleor/config/file.ts).
  That commit is the tip of unmerged branch `NIM-56-stripe-app-file-config-provider`; re-anchor on
  the squash-merge commit once it lands. See
  [Payment Application Configuration Storage Selection](../tech/implementation/IMP-0003%20Payment%20Application%20Configuration%20Storage%20Selection.md).
