---
type: "QA Note"
title: "Known Flaky, Blocked & Backend-Only"
description: "How to distinguish intermittent failures, missing prerequisites, and service-boundary verification without preserving unverified environment-specific assertions."
tags:
  - "qa"
  - "blocked"
  - "flaky"
  - "backend"
  - "agents"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

## Current evidence boundary

The repository does not contain durable evidence that any named product behavior is a
confirmed current flake. Do not carry historical environment observations forward as a
"known flaky" list without a reproducible scenario, execution evidence, affected revisions,
and a review owner.

The Playwright configuration retries failures twice in CI and records trace, video, and
screenshot artifacts under configured conditions (`apps/automated-tests/playwright.config.ts`).
A passing retry is evidence of inconsistency, not proof that the product is flaky: fixture,
environment, and test-code causes must also be considered.

### Common prerequisite boundaries

- Browser tests require `TEST_ENV_URL`.
- Authenticated tests require environment-provided credentials and suitable saved account
  state.
- Checkout tests depend on mutable remote catalog, channel, delivery, pricing, and payment
  configuration described in [Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md).
- Scenarios that mutate external systems may require authorized setup and cleanup that is not
  available from the storefront.

When one of these prerequisites is missing, identify it precisely and report the result as
blocked. Never place credentials or private data in a request for access or in evidence.

### Service-boundary verification

A UI observation cannot prove every server-side effect. Examples in the current codebase
include webhook handling, ledger ingestion, payout execution, connected-account operations,
and payment events. These have route or unit tests under `apps/marketplace/src` and
`apps/stripe/src`, but a deployed end-to-end result may require authorized service logs,
database-safe queries, or provider-side event inspection.

Classify the required observation before testing:

- **UI-visible:** browser state and network evidence may be sufficient.
- **API-visible:** capture the request, response, and authenticated scope.
- **Persistence-visible:** inspect the stored result through an authorized read-only path.
- **External-side-effect-visible:** inspect the receiving service or event record.

If the decisive layer is unavailable, preserve the UI observations and use the outcome
"service-level verification required" from
[Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md).

### Establishing a known flake

Record the exact scenario, frequency over a stated sample, affected environment and revision,
failure signature, controls, retained artifacts, suspected boundary, owner, and review date.
Remove the entry when current evidence no longer supports it. Do not use retries to hide a
deterministic product defect.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md)
[Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md)
