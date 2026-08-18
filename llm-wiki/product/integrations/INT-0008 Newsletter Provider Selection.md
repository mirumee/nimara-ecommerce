---
type: "Integration Contract"
title: "Newsletter Provider Selection"
description: "Build-time contract for selecting and configuring the storefront newsletter provider, whose unset selector is the capability's off state rather than a default."
tags:
  - "integration"
  - "storefront"
  - "newsletter"
  - "email-marketing"
  - "provider-selection"
  - "consent"
created: "2026-08-18T00:00:00+00:00"
status: "candidate"
owner: "engineering"
availability:
  since: null
  deprecated_since: null
---

# Purpose

`NEWSLETTER_SERVICE` selects the email service provider that receives storefront newsletter
subscriptions at build time. Supported provider IDs are `brevo` and `dummy`. Unlike search and
content selection, this contract has **no default**: an unset selector resolves to no provider, and
that resolution is the capability's off state rather than a fallback. The storefront then renders no
newsletter form at all.

One operation crosses the boundary. It carries the subscriber's address, an optional name, the
shopper's locale, and consent expressed as data — the moment consent was granted and the absolute
URL of the privacy policy the shopper was shown. List identifiers, confirmation-template identifiers
and the post-confirmation redirect are configuration of the selected provider and are never
arguments, so no caller holds provider knowledge.

Provider manifests own their configuration schema, configuration mapping, and lazy factory. The
provider catalog and the integration preflight are derived from those manifests rather than from
separate hand-maintained lists.

# Authentication and permissions

- Selection and provider configuration are read on the server. No key for this contract, the
  selector included, is exposed to the client.
- The `brevo` provider requires `NEWSLETTER_BREVO_API_KEY`, `NEWSLETTER_BREVO_LIST_IDS`,
  `NEWSLETTER_BREVO_DOI_TEMPLATE_ID`, and `NEWSLETTER_BREVO_REDIRECT_URL`, and accepts an optional
  `NEWSLETTER_BREVO_TIMEOUT_MS`. The deployment supplies its own account and credentials.
- The `dummy` provider makes no outbound call and requires no credentials.
- Subscription is anonymous. The operation requires no session and touches no existing permission or
  token path.

# Events and operations

1. The server environment parses `NEWSLETTER_SERVICE`, leaving it unset when the value is absent.
2. The storefront resolves the effective provider; `null` means the capability is off and the home
   page omits the form.
3. The first subscribe request lazily imports and constructs the selected implementation; later
   requests reuse the cached instance.
4. The shared use-case validates the consent data before any adapter runs, so no provider is
   reached by a submission without it.
5. The adapter sends one request to the provider under an explicit timeout, then maps the provider's
   outcome onto the contract's success status or error codes.
6. Integration preflight validates the selected manifest's environment schema and reports its
   effective provider and missing or invalid keys, including an explicit line when no provider is
   configured.

# Failure handling and idempotency

- An unsupported `NEWSLETTER_SERVICE` value fails environment validation.
- A selected provider with missing or invalid configuration fails construction; preflight reports
  the same keys before runtime.
- Success carries a status stating that a provider-side confirmation step follows. Failures are
  typed into at least three classes: the provider rejected the address, the provider was unreachable
  or slower than the timeout budget, and the provider's send quota is exhausted.
- The response never varies with list membership. An address already present resolves to the same
  success as a new one, and the failure classes stay membership-blind, so the public form cannot be
  used to test whether an address is on the operator's list.
- No response is cached and no failed call is retried. A timed-out request is ambiguous — the
  provider may have accepted it and already sent the confirmation email — so the shopper's own
  resubmission is the retry, which is safe because duplicates succeed.
- With no provider configured, a direct invocation of the storefront action returns an error result
  rather than a fabricated success.

# Limitations

- A deployment has one newsletter provider at a time; selection cannot vary per request, channel,
  placement, or vendor.
- Changing, enabling or removing the provider requires a rebuild and redeploy.
- Nothing is persisted on the Nimara side, so there is no durability: a submission the provider did
  not accept is not queued anywhere and is surfaced to the shopper instead.
- Confirmation, unsubscribe, preference management and the consent record live with the provider.
  The contract carries consent to it and reads nothing back.
- Provider-side prerequisites are outside the contract's reach: custom contact attributes must exist
  in the provider account before they accept values, and the post-confirmation redirect target is a
  page the deployment owns.
- Abuse protection is not part of the contract. It attaches at the storefront's server-side choke
  point, because the right mechanism is deployment-specific.
