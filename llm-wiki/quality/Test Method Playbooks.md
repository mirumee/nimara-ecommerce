---
type: "QA Playbook"
title: "Test Method Playbooks"
description: "Code-grounded guidance for choosing the least expensive method that directly observes the behavior under test and records its limitations."
tags:
  - "qa"
  - "methods"
  - "playbook"
  - "techniques"
  - "agents"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

Pick the least expensive method that can directly observe the disputed boundary. Escalate
from source inspection to unit, route, browser, persistence, or external-service evidence
only as the assertion requires.

### Pure logic and service behavior

Use the repository's colocated unit tests for deterministic logic, serializers, use cases,
route handlers, webhook validation, and security boundaries. Existing examples live beside
code in `apps/storefront/src/services`, `apps/marketplace/src`, `apps/stripe/src/lib`,
`packages/features/src`, and `packages/i18n/src`.

Assert both success and expected failure paths. For operations returning a domain `Result`,
assert its success flag and data or errors rather than relying only on thrown exceptions.

### Browser journeys

Use the Playwright suite in `apps/automated-tests` when the contract crosses rendered UI,
navigation, cookies, browser storage, embedded payment UI, or several application steps.
Prefer role, label, and test-id locators already used by the page objects. Identify the
specific browser project and environment in the result.

The committed configuration records traces on first retry, video on failure, and screenshots
on failure. Preserve the relevant artifact together with the expected and actual result.

### Timing / race conditions (e.g. lost add-to-cart, slow updates)

- Use controlled latency or delayed responses to widen the suspected ordering window.
- Run both the suspected fast path and a wait-for-completion control.
- After an apparent failure, wait and reload to distinguish a dropped mutation from a stale
  read or delayed render.
- Record the delay profile, attempt count, and whether the failure signature is stable.

Playwright page objects currently use explicit URL and visibility waits around checkout and
cart transitions (`apps/automated-tests/pages`). Preserve or strengthen those synchronization
points when isolating a race.

### API / server-action contract (e.g. wrong HTTP status)

- At the browser boundary, capture the relevant request, response status, response body when
  safe, and correlation information.
- At the route boundary, call the handler with controlled inputs and assert authentication,
  validation, response, idempotency, and side effects. Marketplace and payment webhook tests
  under `apps/marketplace/src/app/api` and `apps/stripe/src/lib` provide current examples.
- Do not infer persistence or an external side effect from a successful HTTP response unless
  that is the defined contract.

### Visual / layout (e.g. misalignment, overlap)

- Use a screenshot for human-readable context and geometry assertions for measurable overlap,
  clipping, or alignment.
- Exercise viewport and content-size partitions rather than one desktop width.
- For interaction defects, add focus, keyboard, accessible-name, and disabled-state assertions;
  the existing browser suite already favors role and label locators.

### SEO / structural (meta tags, sitemap, robots)

- Inspect the server response for status, canonical and social metadata, robots directives,
  structured data, and sitemap entries.
- Verify every referenced asset resolves with the expected content type.
- Use a browser only when client navigation is part of the contract; source-response checks
  are cheaper for server-rendered metadata.

### Performance (mobile/desktop scores)

- Define the user journey, device, runner, network profile, cache state, sample count, and
  metric before measuring.
- Preserve raw measurements and report distribution or variance, not only the best run.
- Compare like with like on an identified revision. The repository does not currently declare
  a dedicated performance-test dependency or committed performance suite, so a measurement
  tool and reproducible invocation must be documented with the result.

### Dev-only console warnings / code patterns (e.g. RSC `params` misuse)

- Source inspection can prove that a pattern exists in the inspected revision. It cannot
  prove runtime behavior or that the inspected revision is deployed.
- Record the exact revision and paths inspected. Use a build or runtime check when compiler,
  bundler, environment, or framework behavior is part of the assertion.

### Backend signals (e.g. `checkout.user`, order transactions, ERP state)

- Identify whether the decisive observation is available through an API, read-only database
  query, application log, webhook event, or external provider record.
- Use the least privileged authorized read path and redact secrets and customer data.
- When the boundary is unavailable, report the result as requiring service-level verification;
  see [Known Flaky, Blocked & Backend-Only](Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md).

### Multi-country / data-driven UI (e.g. address fields)

- Partition against the rules actually returned by the target API and the implementation
  branches documented in [Coverage Maps](Coverage%20Maps.md).
- For each representative, assert field presence, control type, label, required behavior,
  options where applicable, and valid and invalid submission.
- Re-evaluate the generated form after a country change; do not reuse assumptions from the
  previous country. See [Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md).

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](Coverage%20Maps.md)
[Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md)
[Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md)
