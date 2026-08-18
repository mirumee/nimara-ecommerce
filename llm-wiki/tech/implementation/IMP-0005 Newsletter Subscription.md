---
type: "Implementation Record"
title: "Newsletter Subscription"
description: "Replaces the storefront's newsletter stub with a configuration-gated capability behind a provider-neutral subscribe boundary, a maintained Brevo adapter, and no subscriber data held by Nimara."
tags:
  - "implementation"
  - "storefront"
  - "newsletter"
  - "email-marketing"
  - "consent"
  - "provider-selection"
created: "2026-08-18T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "653c704abd64b93a08881e89425e87ccc0024bed"
  url: null
relations:
  prds:
    - "[PRD-004 Newsletter Subscription](../../prd/PRD-004%20Newsletter%20Subscription.md)"
  rfcs:
    - "[RFC-0001 Newsletter Subscription](../RFC/RFC-0001%20Newsletter%20Subscription.md)"
  adrs:
    - "[ADR-0003 Newsletter Subscription Is Configuration-Gated With No Default Provider](../ADR/ADR-0003%20Newsletter%20Subscription%20Is%20Configuration-Gated%20With%20No%20Default%20Provider.md)"
    - "[ADR-0004 Brevo Is The Reference Newsletter Provider Adapter](../ADR/ADR-0004%20Brevo%20Is%20The%20Reference%20Newsletter%20Provider%20Adapter.md)"
    - "[ADR-0005 The Newsletter Subscribe Contract Is Provider-Neutral And Membership-Blind](../ADR/ADR-0005%20The%20Newsletter%20Subscribe%20Contract%20Is%20Provider-Neutral%20And%20Membership-Blind.md)"
  product_records:
    - "[Storefront Newsletter Subscription](../../product/capabilities/CAP-0008%20Storefront%20Newsletter%20Subscription.md)"
    - "[Newsletter Provider Selection](../../product/integrations/INT-0008%20Newsletter%20Provider%20Selection.md)"
    - "[OPS-0001 Storefront Deployment and Configuration Validation](../../operations/OPS-0001%20Storefront%20Deployment%20and%20Configuration%20Validation.md)"
  rolled_back_by: null
pull_requests: []
verification:
  - criterion: "AC-1 — with a provider configured, a submission with consent given reaches the provider's list and the shopper sees success only after the provider accepted it."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
      - "apps/automated-tests/tests/e2e/pages/homepage.spec.ts"
  - criterion: "AC-3 — replacing the provider adapter needs no fork of the shared implementation, because no provider-shaped parameter crosses the boundary."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
  - criterion: "AC-4 — with no provider configured the form is absent from the home page and the capability reports as off."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
      - "apps/storefront/src/services/utils/integration-doctor.test.ts"
      - "apps/automated-tests/tests/e2e/pages/homepage.spec.ts"
  - criterion: "AC-5 — a rejected address, an unreachable or timed-out provider, and an exhausted quota each produce an actionable failure rather than a success, with no retry."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
  - criterion: "AC-6 — a submission without consent sends no address to the provider, and the form explains the requirement."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
      - "apps/automated-tests/tests/e2e/pages/homepage.spec.ts"
  - criterion: "AC-7 — the storefront states that a confirmation step follows and neither confirms nor stores the address; an address already present is indistinguishable from a new one."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
      - "apps/automated-tests/tests/e2e/pages/homepage.spec.ts"
  - criterion: "NFR-4 / FR-8 — no subscriber data reaches a Nimara-side store, log line, or captured exception."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter.test.ts"
rollout: "Adding configuration is the whole rollout. A deployment that leaves NEWSLETTER_SERVICE unset is unaffected: the newsletter form disappears from the home page, which is the designed off state, and nothing else changes. To enable it, complete the provider-side prerequisites first — for Brevo, get the account approved for sending, create the CONSENT_AT and CONSENT_URL contact attributes, create the list(s) and the double-opt-in template, and publish a confirmation page the deployment owns — then set NEWSLETTER_SERVICE plus the NEWSLETTER_BREVO_* keys, confirm with `pnpm preflight --report`, and rebuild. Selection is read at build time. The public demo must not be enabled before PRD-004 Q-1 (abuse protection) and Q-2 (erasure requests) are answered."
rollback: "Remove the provider configuration and rebuild, or restore the previous deployment. Nothing is persisted by this change, so there is no schema change, no migration, and no stored state to undo. Subscribers already delivered live in the provider account and are unaffected either way. Reverting the code reinstates the stub that reported success and stored nothing, which is the defect this change removed."
---

# Implementation summary

The home page's newsletter form submitted to `newsletterSubscribeAction`, which returned
`{ ok: true }` and stored nothing, while the client showed a success toast on that result. The
repository therefore published a capability it did not have. That action is deleted rather than left
beside the working one.

The capability is a new swappable provider under `packages/infrastructure/src/newsletter/`, built on
the same manifest-and-selector mechanism as search and content selection: a manifest per provider
owning its Zod configuration schema and its lazy factory, with the provider-id catalog and the
preflight report derived from the manifests. It differs from the existing capabilities in one way
that carries the design — it has no default provider, so an unset `NEWSLETTER_SERVICE` resolves to
`null` and that resolution is the off state, not a fallback. `resolveNewsletterProvider` therefore
skips the Saleor fallback the other resolvers apply.

One operation crosses the boundary: address, optional name, locale, and consent as data. List ids,
template ids and the redirect URL stay inside the selected adapter's configuration. Locale crosses so
the Brevo adapter can select a per-locale confirmation template, which is why
`NEWSLETTER_BREVO_DOI_TEMPLATE_ID` accepts either a bare id or a locale-keyed JSON map with a
`default` key.

Consent is enforced in the shared use-case, in front of every adapter, rather than in each one. The
server action re-validates the submission and then stamps consent itself: the timestamp and the
privacy-policy URL are the server's, so a forged submission cannot claim the shopper agreed to
something they were never shown. The home page passes that action to the view only when a provider
resolves, so the render gate and the action are one value rather than a boolean and a callback that
could disagree. The registry's empty newsletter service returns an error result rather than a
success, because the action is a public endpoint and the gate can be bypassed by calling it directly.

The Brevo adapter posts once to `contacts/doubleOptinConfirmation` over `fetch` with
`AbortSignal.timeout` and no retry, and maps outcomes onto three error classes — rejected address,
provider unavailable, quota exhausted — collapsing "accepted" and "already present" into the same
success. From an error body it reads the machine-readable `code` and matches the `message` against a
whitelist of its own request field names, returning only the matched name; the message itself is
never logged, returned, or attached to an error, because Brevo echoes the submitted contact in it.
That field name is what separates a shopper's problem from the operator's: a `400` naming `email` is
a rejected address, and a `400` naming a list, template, redirect or contact attribute is
unavailability. The observability line carries the provider id, outcome class, provider status, code
and field, and the call duration, and nothing derived from the subscriber.

A `dummy` adapter carries the configured happy path with no outbound call, so the whole submission
path runs without an account, an email, or send quota.

# Deviations

- **RFC-0001's deferred decision was answered "no".** Nimara ships no "subscription confirmed" page.
  `NEWSLETTER_BREVO_REDIRECT_URL` is a required, deployment-owned absolute URL, and the integration
  guide states that pointing it at the home page leaves the shopper with no acknowledgement.
- **The timeout override is named `NEWSLETTER_BREVO_TIMEOUT_MS`.** RFC-0001 described the override
  without naming it; the name follows the `NEWSLETTER_<PROVIDER>_*` convention. Its default is
  3000 ms, which is RFC-0001's design figure and not a measured one — the first real deployment
  should tune it.
- **`NEWSLETTER_BREVO_DOI_TEMPLATE_ID` accepts a locale map as well as a single id.** RFC-0001 named
  one variable and separately required that locale be usable for template selection; a JSON value
  reconciles both without adding a variable, following the `SEARCH_ALGOLIA_INDICES` precedent.
- **A `400` is only blamed on the address when Brevo named the `email` field.** RFC-0001 and ADR-0005
  fix three shopper-facing classes and forbid emitting the provider's message, which together left a
  misconfigured list, template, redirect or contact attribute surfacing as "check the address you
  typed" — an instruction the shopper cannot act on. The adapter now matches the message against a
  whitelist of its own request fields and returns only the matched field name, never the message. A
  `400` naming anything other than `email` resolves to provider unavailability, and the field name is
  logged as `providerField`. This adds no shopper-facing class, so ADR-0005 stands as written; it
  makes the operator's mistake diagnosable without putting a subscriber in a log line.
- **Unit coverage lives in `apps/storefront`.** `packages/infrastructure` has no test runner, and
  adding one would mean adding a dependency. The tests import the adapter through its public entry
  point and stub the transport, so they exercise the real mapping.
- **Brevo requires the confirmation template to carry the tag `optin`, which ADR-0004 and RFC-0001
  both missed.** Without it the subscribe call fails with `400 invalid_parameter` /
  `An active DOI template does not exist` regardless of the id passed, and setting the tag flips the
  template's `doiTemplate` flag to `true`. The trap is that an untagged template still sends
  perfectly as an ordinary transactional email, so verifying the template that way proves nothing.
  Verified against a live account on 2026-08-18, together with the confirmation-link tag
  `{{ params.DOIurl }}`, which is not the tag Brevo's own sign-up forms use. Both are now stated as
  hard prerequisites in the integration guide; neither is something the adapter can detect.
- **A successful subscribe call answers `201` or `204`, and both mean the email was sent.** The
  adapter treats every `2xx` as acceptance, which a live account confirmed: both statuses produced
  `requests` and `delivered` events, and the contact appeared on the configured list only after the
  recipient confirmed.
- **ADR-0004's claim that Brevo silently drops unknown contact attributes is still unverified.** The
  missing-DOI-template error masked every other cause during live testing, so whether an absent
  `CONSENT_AT` / `CONSENT_URL` is dropped or rejected with a `400` remains open. Either way the
  attributes are a documented prerequisite; only the failure mode is uncertain.
- **ADR-0004's free-tier figures could not be re-verified.** The Brevo API contract, error codes and
  error-body shape were re-verified against the vendor's developer documentation on 2026-08-18. The
  pricing page renders its plans client-side and returned no plan detail, so the 300 emails/day cap,
  the send-approval step and the branding add-on remain as ADR-0004 captured them and still need a
  human check before the demo is enabled.
- **Newsletter e2e coverage is configuration-aware rather than unconditional.** The suite runs
  against a deployed URL whose environment it cannot set, so `enabledHomepageElements.newsletter`
  now states whether the tested deployment configures a provider. Its `false` branch asserts the
  form is absent, which PRD-004 R-8 expected to be lost and which was in fact never asserted before.

# Verification evidence

`apps/storefront/src/services/integrations/tests/newsletter.test.ts` covers the boundary: the
selector resolving to `null` with no default, the empty service failing instead of fabricating a
success, Brevo failing construction without its keys, the consent gate blocking both missing and
relative-URL consent data before any `fetch`, the request body carrying configuration rather than
caller arguments, per-locale template selection, each error class from its provider status and code,
a `400` about a list or a consent attribute resolving to unavailability rather than blaming the
address, the named field reaching the log as `providerField`, a duplicate answering exactly like a
new subscription, a single call on timeout, and the absence of the address, the name and the
provider's message from both the log lines and the returned error.

`apps/storefront/src/services/utils/integration-doctor.test.ts` covers the preflight report: the
capability reading as having no provider until the selector names one, and the four Brevo keys being
flagged once it does. `pnpm preflight --report` was run in all three states — unset, `brevo` without
keys, and `dummy` — and printed off, missing-keys, and on respectively.

`apps/automated-tests/tests/e2e/pages/homepage.spec.ts` covers the browser: presence or absence
matched against the deployment's configuration, submission blocked until consent is given, and a
successful submission stating that a confirmation step follows, reached through a keyboard-only
consent control.

The storefront unit suite passes at 66 tests. `packages/domain`, `packages/infrastructure`,
`packages/features` and `apps/storefront` typecheck clean, and the documentation site builds with no
broken links.

No automated test targets a real provider account. The Brevo path against a live account, including
the confirmation email and the post-confirmation redirect, is verified once by a person before the
demo is enabled.
