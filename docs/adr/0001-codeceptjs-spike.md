---
status: proposed
review-by: 2026-08-13
---

# Trial CodeceptJS alongside Playwright with a homepage smoke test

`apps/automated-tests` carries 5 Playwright specs served by 9 class-based page objects, and the
selector/fixture boilerplate is a meaningful share of that code. To find out whether CodeceptJS is
worth adopting, we added a working CodeceptJS setup with a single homepage smoke test and left all 5
Playwright specs untouched. This is a time-boxed trial, not a migration: by **2026-08-13** we either
migrate the Playwright specs or delete `codecept/`, `codecept.conf.ts`, `steps.d.ts`, and the three
devDependencies. Leaving it undecided is the one outcome we explicitly rejected, because maintaining
two runners permanently costs more than either runner alone.

## Considered Options

- **Minimal working trial, then decide** (chosen). Ships a reversible evaluation and keeps `main`
  releasable.
- **Migrate all 5 specs at once.** Rejected: commits to rewriting 9 page objects before the
  ergonomics have been felt, and a regression means reverting the whole suite.
- **Permanent coexistence**, CodeceptJS for new areas only. Rejected: two runners, two configs,
  two selector idioms, and two flake surfaces, forever.

## What the trial demonstrates

`codecept/homepage_test.ts` covers two scenarios against the storefront homepage — the page loads
with its product carousel, and the hero CTA opens the product listing — through the page object in
`codecept/pages/homepage.ts`. It **passes against a deployed environment** (2 passed, verified twice
for stability), which is the point: the setup is proven end to end, not just proven to load.

**There is no like-for-like authoring-cost measurement in this trial, and no such claim should be
read into it.** An earlier iteration ported the `logIn` journey scenario-for-scenario and measured
132 → 91 lines (−31%), but that port was removed as unnecessary, so the number is not reproducible
from this repository and is recorded here only as a discarded observation. The committed homepage
test covers 2 scenarios against Playwright's 6 homepage tests, so comparing their line counts would
be measuring different amounts of coverage. Anyone wanting a defensible authoring-cost number must
port a journey scenario-for-scenario first.

What the trial does establish qualitatively: CodeceptJS needs no `fixtures.ts` registration (one
entry in the config's `include` map replaces it), no `Page` constructor plumbing or `readonly
Locator` declarations, and no explicit `expect(...).toBeVisible()` calls, since `I.seeElement`
auto-waits. Against that, it adds a generated `steps.d.ts` that must be committed and regenerated
whenever a page object changes (`pnpm test:codecept:def`).

## Consequences

- **It is deliberately not in CI.** `e2e.yaml` is untouched, so the trial never gates a workflow and
  never adds flake surface to a required check. The files are still covered by the required
  `Linters & Tests` check via ESLint and Prettier. The cost is that nobody finds out from CI if the
  trial breaks; it is run manually with `pnpm test:codecept`.
- **`playwright` is pinned to an exact `1.59.1`** to match `@playwright/test`. A caret range
  resolves to 1.62.0, which would install a second `playwright-core` and download a second set of
  browser binaries in CI.
- **The dependency surface is much larger than three packages, and this was accepted knowingly.**
  The lockfile diff is +1393/−167: 84 genuinely new packages, plus ~53 existing entries re-keyed
  across the `next` peer graph (storefront, marketplace, stripe, docs). No existing package version
  regressed, with one exception — `express` gains a second major, `5.2.1`, alongside `4.22.1` in the
  dev tree. The cause is that `codeceptjs@4.1.0` declares as **hard, non-optional** dependencies:
  `ai@^6.0.43` with `@ai-sdk/gateway`/`provider`/`provider-utils` (the Vercel AI SDK, for its AI and
  self-healing features), `@modelcontextprotocol/sdk@^1.26.0` (which pulls `hono`,
  `@hono/node-server`, `express@5`), `@codeceptjs/configure@^4.0.0-beta.4` (a beta as a hard
  dependency), the `@cucumber/*` Gherkin stack whether or not BDD is used, plus `axios`, `multer`,
  `mocha`, `monocart-coverage-reports`, `zod`, and `cheerio`. All of it is dev-only — none reaches a
  production bundle or the Vercel runtime — and the trial is time-boxed, so the exposure is
  temporary by construction. Whoever makes the migrate-or-delete call on 2026-08-13 must weigh this
  cost against a benefit that is, as of now, only qualitative: adopting CodeceptJS permanently means
  accepting an AI SDK, an MCP server SDK, and a beta package in the repo's dev tree indefinitely.
- **`noGlobals: true` is set**, which is the v4 default for new projects and silences a deprecation
  warning on every run. `Feature`/`Scenario`/`Before` and `inject()` still work unimported, but
  `within`, `session`, `secret`, `locate`, `actor`, `dataTable`, and the `Helper` base class must be
  imported if a future test needs them.
- **Playwright's `testMatch` is now pinned** to `**/*.spec.ts` so it can never collect the
  CodeceptJS `*_test.ts` files.
- **`.claude/rules/testing.md` says "use Playwright for end-to-end tests", which this trial
  contradicts.** The rule is intentionally left unchanged — Playwright remains the standard until
  this ADR is resolved. Whichever way the decision goes on 2026-08-13, that rule must be updated
  or the trial removed.

## Incidental findings, not addressed here

- **`storeHeaders.heroBanner` does not match the deployed demo storefront.** `utils/constants.ts`
  expects "Power your store with Nimara"; the environment renders "Welcome to Nimara Demo Store".
  Consequently the existing Playwright test `Homepage › Hero banner elements are present @CI` fails
  there (verified: 5 passed, 1 failed on `homepage.spec.ts`). The CodeceptJS smoke test deliberately
  asserts `storeHeaders.productsCarousel` instead, which does match. Whether the constant or the
  environment content is wrong is a separate question.
- **`apps/automated-tests/turbo.json`** declares `test:e2e` inputs of `./tests/e2e/**/*.test.ts` and
  `playwright.config.json`, neither of which matches reality (`*.spec.ts`, `playwright.config.ts`),
  so that task's cache keys do not track its inputs. A pre-existing bug, worth its own change.
