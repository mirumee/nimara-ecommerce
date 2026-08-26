---
type: "Implementation Record"
title: "Storefront Newsletter Subscription"
description: "Delivers the storefront newsletter subscribe section as a configuration-selected, provider-neutral capability with Klaviyo first, and makes a capability whose provider is selected but unconfigured degrade to a refusal instead of failing the request."
tags:
  - "implementation"
  - "storefront"
  - "newsletter"
  - "email"
  - "provider-selection"
created: "2026-08-26T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "781"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/781"
relations:
  prds:
    - "[PRD-004 Newsletter Subscriptions](../../prd/PRD-004%20Newsletter%20Subscriptions.md)"
  rfcs:
    - "[RFC-0001 Newsletter Subscription Provider Seam](../RFC/RFC-0001%20Newsletter%20Subscription%20Provider%20Seam.md)"
  adrs:
    - "[ADR-0004 Newsletter Capture Is A Selectable Provider Capability](../ADR/ADR-0004%20Newsletter%20Capture%20Is%20A%20Selectable%20Provider%20Capability.md)"
  product_records:
    - "[Storefront Newsletter Subscription](../../product/capabilities/CAP-0008%20Storefront%20Newsletter%20Subscription.md)"
    - "[Newsletter Provider Selection](../../product/integrations/INT-0008%20Newsletter%20Provider%20Selection.md)"
    - "[Swappable Storefront Search and Content Providers](../../product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)"
    - "[Storefront Deployment and Configuration Validation](../../operations/OPS-0001%20Storefront%20Deployment%20and%20Configuration%20Validation.md)"
    - "[Storefront Provider Change and Rollback](../../operations/OPS-0006%20Storefront%20Provider%20Change%20and%20Rollback.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/781"
verification:
  - criterion: "AC-1: on a fresh clone with provider credentials, the documented walkthrough reaches a working subscription with no application code file changed. The timed walkthrough that M-1 measures has not been executed; the automated checks below only prove that selection and provider configuration are read from the environment."
    tests:
      - "apps/storefront/src/services/utils/integration-doctor.test.ts"
      - "apps/storefront/src/services/integrations/tests/resolvers.test.ts"
  - criterion: "AC-2: a deployment with no configured provider renders no subscribe section. A provider selected without its keys counts as unconfigured. The mirror case in a browser needs a deployment without a provider and stays a manual check."
    tests:
      - "apps/storefront/src/services/utils/integration-doctor.test.ts"
      - "apps/storefront/src/services/integrations/tests/create-loader.test.ts"
  - criterion: "AC-3: the rendered form shows the purpose text and a link to the privacy policy, and the email address is the only input."
    tests:
      - "apps/automated-tests/codecept/newsletter_test.ts"
  - criterion: "AC-4: a valid address reaches the provider, which records a pending subscription and sends the confirmation message. The request Nimara sends is covered by tests; the pending state and the message belong to the provider and were observed by a live read of the account."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter-klaviyo.test.ts"
      - "packages/features/src/home-page/shared/actions/newsletter-subscribe.core.test.ts"
  - criterion: "AC-5: the shopper sees a success message only after the provider acknowledges the request with 202."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter-klaviyo.test.ts"
  - criterion: "AC-6: a provider error or a timeout produces a failure message and a logged event, and no success message. No log entry carries the submitted address."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter-klaviyo.test.ts"
      - "apps/automated-tests/codecept/newsletter_test.ts"
  - criterion: "AC-7: an invalid address shows a validation message on the field and calls no provider. The server rejects an address that is malformed or longer than the shared field bound, so a direct post cannot bypass the form."
    tests:
      - "packages/features/src/home-page/shared/actions/newsletter-subscribe.core.test.ts"
      - "apps/automated-tests/codecept/newsletter_test.ts"
  - criterion: "AC-8: a confirmed subscriber is present in the provider list within one minute of confirmation. This is a provider-side property with no automated coverage; it rests on the manual release check described under Verification evidence."
    tests:
      - "apps/storefront/src/services/integrations/tests/newsletter-klaviyo.test.ts"
rollout: "Set three server-side values per environment and rebuild, because provider selection is read at build time: NEWSLETTER_SERVICE=klaviyo, NEWSLETTER_KLAVIYO_PRIVATE_API_KEY (scopes lists:write, profiles:write, subscriptions:write) and NEWSLETTER_KLAVIYO_LIST_ID. The Klaviyo list must have double opt-in enabled, which no check in the repository can verify. Leaving NEWSLETTER_SERVICE unset ships the change inert: no section, no submission accepted. Setting it without both keys renders no section either, and the first request logs a critical event naming the missing keys. Confirm the result with `pnpm preflight --report`, or with `/api/preflight` on a development server; that route answers 404 in production by design. Klaviyo sends the confirmation message from a shared domain until a sending domain is verified, so early confirmations are likely to be filed as spam."
rollback: "Remove NEWSLETTER_SERVICE and redeploy. The section stops rendering and a submission posted by a stale client is refused; there is no feature flag and no other switch. Nimara persists no subscriber, so nothing in this repository needs undoing. Subscribers already delivered stay in the merchant's provider account, which owns them together with the consent record and the unsubscribe link, and no rollback here removes them. Restoring a release that predates the change reinstates the previous stub, which reported success to every shopper and stored nothing."
---

# Implementation summary

The storefront rendered a subscribe box whose action returned success and stored nothing. Newsletter
capture is now a selectable capability in the shape search and content already use, and
`NEWSLETTER_SERVICE` chooses the implementation with no default value, because the commerce backend
serves no newsletter. Klaviyo is the first provider, on its bulk subscribe job endpoint with a
private key and a pinned API revision, and only `202 Accepted` counts as success. The provider owns
the subscriber, the list, the confirmation message, the consent record and the unsubscribe link;
Nimara owns capture, validation, consent text and the result states.

What changed file by file is the pull request. This record carries what the diff cannot: the
deviations from the design, the mapping from acceptance criteria to tests, what stayed unverified,
and how to ship and undo the change.

# Deviations

- The design selected the `klaviyo-api` package. Implementation replaced it with platform `fetch`,
  because the package requires Node's `querystring` and three storefront `opengraph-image` routes
  run on the edge runtime and import the service registry, which broke the build. The API revision
  is pinned in a constant instead of through a package version. Recorded in RFC-0001 under
  Dependencies.
- RFC-0001 stated that provider resolution is the single answer to whether a provider is configured.
  That was wrong in both directions, and each half produced a defect on a deployment that selected a
  provider without its keys. The loader threw, because every provider configuration mapper validates
  with a throwing `parse` and only an unselected provider fell back to the empty service, so the
  form reported neither success nor failure. The render gate passed, so that same deployment
  published a form that could never succeed. The gate now requires the configuration to validate,
  the loader catches a failed construction and memoizes the fallback, and the registry logs the
  missing keys once when it is built. Corrected in the RFC.
- Two hardening changes were not in the design. The server-side schema bounds the address with the
  shared field length, which the form already applied and the action did not, and the Server Action
  narrows the errors it returns to a code and a field, so provider status text and the name of an
  environment variable no longer reach an anonymous client.
- End-to-end coverage is narrower than the QA scenarios RFC-0001 lists. The suite runs against one
  environment, so the no-provider case cannot be asserted beside the configured cases, and no
  scenario submits an address the provider would accept, because a passing run must not write a
  profile into the merchant's list.

# Verification evidence

Unit coverage: 69 tests in `apps/storefront` and 25 in `packages/features`, all passing. The
provider tests assert the success path on `202`, a rejection carrying the response status, an
aborted request, a network failure, and that no failure log contains the submitted address. The
loader tests assert the empty-service fallback for an unselected provider and for a failed
construction, and that a failed construction is not retried. `isCapabilityConfigured` is covered for
a complete configuration, an incomplete one, and an unselected provider whose report row is
otherwise `ok`.

Browser coverage: `apps/automated-tests/codecept/newsletter_test.ts`, tagged `@newsletter`, three
scenarios passing against a deployment with the provider configured. See
[Coverage Maps](../../quality/Coverage%20Maps.md) for what the tag requires and what stays manual.

Provider-side observation, 2026-08-26: a submission on a development server reached the configured
Klaviyo account, which held the profile against the list with consent absent — the pending state
double opt-in produces before confirmation — and no suppression. The list reported
`opt_in_process: double_opt_in`. The confirmation message was delivered to spam, which is expected
of an account without a verified sending domain and is not a property of this change.

Not verified: M-1, the timed walkthrough on a fresh clone that carries the entire business bet of
PRD-004, has not been executed. AC-8 rests on the observation above rather than on a measured
confirmation-to-list interval. Both are release checks, and this record must not be moved to
`implemented` while they are outstanding.
