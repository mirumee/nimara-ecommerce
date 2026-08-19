---
type: "Architecture Decision Record"
title: "CodeceptJS Is The End-To-End Test Engine"
description: "CodeceptJS replaces Playwright as the only end-to-end engine in apps/automated-tests. The Playwright library stays as the browser driver, and the deleted Playwright coverage is not ported."
tags:
  - "adr"
  - "qa"
  - "testing"
  - "e2e"
  - "codeceptjs"
  - "tooling"
created: "2026-08-18T00:00:00+00:00"
status: "accepted"
owner: "engineering"
superseded_by: null
---

## Context

`apps/automated-tests` ran two end-to-end engines at the same time. Playwright held 6 specs,
9 class page objects and one fixture file. CodeceptJS arrived beside it as a time-boxed
trial, recorded in `docs/adr/0001-codeceptjs-spike.md`, which set a decision date of
2026-08-13: migrate the Playwright specs, or delete the trial. That record rejected permanent
coexistence, because two runners mean two configs, two selector idioms and two flake
surfaces. It also named leaving the question undecided as the one outcome it refused.

The date passed without a decision. Meanwhile the trial grew past the single homepage smoke
test it was scoped to, and gained guest-checkout and login scenarios.

Two facts constrain any resolution. First, CodeceptJS drives the browser through the
Playwright helper, so the `playwright` package is its driver and cannot be removed with the
runner. Second, the two suites did not cover the same ground: Playwright alone covered the
checkout step guard and the category page, and CodeceptJS alone covered card-decline
negatives.

## Decision

We will make CodeceptJS the only end-to-end engine.

We remove the Playwright test-runner layer: the `@playwright/test` and
`eslint-plugin-playwright` dev dependencies, `playwright.config.ts`, the 6 specs, the 9 class
page objects, the fixture file, and the `utils/` directory that only they consumed. The one
cross-boundary import, from a CodeceptJS page object into `utils/constants.ts`, moves to
`codecept/data/constants.ts`.

We keep the `playwright` package, pinned to an exact `1.59.1`, because it is the browser
driver behind `helpers.Playwright`. The pin is what keeps one `playwright-core` and one set
of browser binaries. A caret range resolves to a later minor and installs a second copy of
both.

**We delete the Playwright coverage rather than porting it.** This is the substance of the
decision, not a detail of it.

## Consequences

### Coverage is lost, and this was accepted deliberately

- **Category page: 8 tests to zero.** Category name and breadcrumb, the breadcrumb Home
  link, product list visibility, a product click through to the detail page, sorting through
  the URL, the filter panel, pagination, and the unknown-slug not-found page. No CodeceptJS
  scenario covers this surface. A whole page type is now unexercised.
- **Checkout step guard: 9 tests to zero.** This is the most consequential loss. It was the
  only browser evidence for IMP-0004, which records that these tests detected the defect they
  were written for. A regression is now caught only by the 22 unit cases in
  `apps/storefront/src/foundation/checkout/steps.test.ts`. The criterion those units do not
  reach, that the payment section does not render for a checkout that cannot be ordered, has
  no automated coverage at any level.
- **Login: 5 tests to 1.** The surviving scenario signs in with configured credentials. Page
  UI assertions, the password visibility toggle, and the redirects to sign-in and
  reset-password are gone.
- **Homepage: 6 tests to 2.** The carousel heading and the listing navigation remain. Hero
  banner elements, the hero button, the products link and the newsletter section are gone.
  The real loss is smaller than four, because three of those tests already asserted against
  `enabledHomepageElements` flags that are all `false`, and ADR 0001 recorded the hero-banner
  test failing against the deployed demo storefront.
- **Guest checkout gains breadth and loses depth.** CodeceptJS runs 5 scenarios against
  Playwright's 1, including two cart entry points, a two-item cart, and stolen-card and
  expired-card negatives. But the deleted spec asserted the order summary against a
  configured product price and delivery amount. Those price assertions are gone, and
  `formatAsPrice` was deleted with `utils/`.
- **Logged-in checkout: 1 test, never executed.** It was marked `fixme`, so nothing runnable
  is lost. The recorded reason must survive: the payment step fails to render server-side for
  a logged-in shopper with a saved payment method.

### The browser matrix and the failure evidence both narrow

Playwright ran desktop Chrome, Firefox and a Safari-like project, retried twice in CI, and
kept a trace on first retry with video and screenshots on failure. `codecept.conf.ts`
launches chromium only and configures no retries. CodeceptJS keeps its default `screenshot`
plugin, so a failed scenario writes one screenshot to `apps/automated-tests/output/`. There
is no trace, no video and no HTML report. A first failure now carries less evidence than it
did, and one flake fails the run outright.

### The dependency cost that ADR 0001 called temporary is now permanent

`codeceptjs@4.1.0` declares as hard, non-optional dependencies: `ai` with the
`@ai-sdk/gateway`, `provider` and `provider-utils` packages, which is the Vercel AI SDK;
`@modelcontextprotocol/sdk`, which pulls `hono`, `@hono/node-server` and a second major of
`express`; `@codeceptjs/configure` at a beta version; the `@cucumber/*` Gherkin stack whether
or not anyone writes Gherkin; plus `axios`, `multer`, `mocha`,
`monocart-coverage-reports`, `zod` and `cheerio`. ADR 0001 counted 84 new packages and
justified the exposure as temporary by construction. That justification is gone. The net
package count rises: 84 in, 2 out. All of it is dev-only and none of it reaches a production
bundle or the Vercel runtime.

ADR 0001 also stated plainly that the trial produced no like-for-like authoring-cost
measurement, and that its earlier −31% line-count figure is not reproducible from the
repository. This decision does not revive that number. What is real and qualitative: a page
object needs one entry in an `include` map instead of fixture registration, there is no
`Page` or `Locator` plumbing, and `I.seeElement` auto-waits. Against that, `steps.d.ts` is
generated, committed, and must be regenerated whenever a page object changes.

### The suite now runs in CI, which the trial deliberately avoided

ADR 0001 kept the trial out of `e2e.yaml` so it could never gate a workflow. The renamed
`test:e2e` script means `e2e.yaml` now runs CodeceptJS on manual dispatch, with no retries.
The workflow is still `workflow_dispatch` only, so the suite gates no required check, exactly
as before.

Because the suite now runs there, the job maps `USER_EMAIL` and `USER_PASSWORD` from
repository secrets; without them the login scenario fills empty fields and times out. The
Lighthouse steps carry `if: always()`, so a failed or flaky scenario no longer skips the
performance run. The guest-checkout scenarios place real Stripe test orders against the
dispatched environment on every run.

### The homepage smoke test changed channel

Its page object read `URLS()` from `utils/constants.ts`, which defaulted to channel `gb` and
loaded the `/gb` prefix. It now reads the `URLS` object from `codecept/data/constants.ts`,
which is keyed on `LOCALE` and defaults to `us`, so it loads the unprefixed path. Both
resolve: the storefront routes `/` as en-US and `/gb` as en-GB. This removes a split, because
the login and guest-checkout scenarios already used the `us` default with US product slugs.
Verified against the deployed demo storefront: 2 passed with the default, and 2 passed with
`LOCALE=gb`.

`LOCALE` also selects the address fixture, so `codecept/data/locales.ts` rejects a value
outside `us` and `gb` rather than falling back to `us`. A fallback would run US URLs with GB
address data and fail mid-checkout on a missing field instead of at startup.

### Named follow-ups

- Re-author the lost checkout step guard and category coverage.
- Consolidate `codecept/pages/homepage.ts` and `codecept/pages/homepagePage.ts`, a duplicate
  pair that now reads one constants module.
- Configure retries and screenshot or trace plugins if triage evidence proves too thin.
- `playwright` is referenced only by the helper name in `codecept.conf.ts`, so a dead-code
  sweep will report it as unused. Removing it takes the whole suite down.
- `apps/automated-tests` has no `typescript` dependency and no type-check step, so a latent
  type error in `codecept/pages/checkoutPage.ts` went unnoticed.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[Coverage Maps](../../quality/Coverage%20Maps.md)
[Test Method Playbooks](../../quality/Test%20Method%20Playbooks.md)
[IMP-0004 Checkout Step Guard Enforcement](../implementation/IMP-0004%20Checkout%20Step%20Guard%20Enforcement.md)
