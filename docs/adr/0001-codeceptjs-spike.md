---
status: proposed
review-by: 2026-08-13
---

# Trial CodeceptJS alongside Playwright for one E2E journey

`apps/automated-tests` carries 5 Playwright specs served by 9 class-based page objects, and the
selector/fixture boilerplate is a meaningful share of that code. To find out whether CodeceptJS
would reduce it, we ported one journey — the `logIn` flow — to CodeceptJS and left the other four
specs on Playwright. This is a time-boxed trial, not a migration: by **2026-08-13** we either
migrate the remaining specs or delete `codecept/`, `codecept.conf.ts`, `steps.d.ts`, and the three
devDependencies. Leaving it undecided is the one outcome we explicitly rejected, because
maintaining two runners permanently costs more than either runner alone.

## Considered Options

- **Trial one journey, then decide** (chosen). Ships a reversible evaluation and keeps `main`
  releasable.
- **Migrate all 5 specs at once.** Rejected: commits to rewriting 9 page objects before the
  ergonomics have been felt, and a regression means reverting the whole suite.
- **Permanent coexistence**, CodeceptJS for new areas only. Rejected: two runners, two configs,
  two selector idioms, and two flake surfaces, forever.

## The criterion

Authoring cost for the same 5 scenarios and the same assertions:

|                                                                                   | Lines   |
| --------------------------------------------------------------------------------- | ------- |
| Playwright: `logIn.spec.ts` (57) + `LogInPage.ts` (71) + `fixtures.ts` wiring (4) | **132** |
| CodeceptJS: `logIn_test.ts` (40) + `pages/logIn.ts` (51)                          | **91**  |

**−41 lines (−31%).** Config counterparts (`playwright.config.ts` 59, `codecept.conf.ts` 33) are
excluded from both sides as infrastructure rather than per-journey cost. `BasePage.ts` (24) is also
excluded — it is shared across all 9 page objects, so charging it to one journey would overstate
the saving.

The measurement carries a **known confound**, recorded here rather than hidden: the CodeceptJS
version is written in idiomatic CodeceptJS style (plain object, inline ARIA locators) while the
Playwright version is class-based with declared `Locator` fields, so the delta reflects both
framework and authoring style. The portion that is genuinely framework-forced, and not available
by restyling the Playwright code, is:

- the 4 lines of `fixtures.ts` registration per page object, replaced by one entry in the config's
  `include` map;
- the `Page` constructor plumbing and `readonly Locator` declarations, which CodeceptJS has no
  equivalent of;
- explicit `expect(...).toBeVisible()` calls, which collapse into auto-waiting `I.seeElement`.

Against that, CodeceptJS adds a generated `steps.d.ts` that must be committed and regenerated when
page objects change (`pnpm test:codecept:def`) — roughly cancelling the fixture-wiring saving.

## Consequences

- **The trial is unverified against a live environment.** The scaffold is confirmed working up to
  the first navigation — config loads, `tsx/esm` transpiles, the page object injects, ARIA locators
  resolve, all 5 scenarios are collected. The assertions have never run green, because
  `TEST_ENV_URL` points at `localhost:3000` locally. The existing Playwright suite fails identically
  for the same reason, so this is a pre-existing constraint, not a CodeceptJS one.
- **It is deliberately not in CI.** `e2e.yaml` is untouched. Since the criterion is read off the
  source, a browser run adds nothing to the decision, and a duplicated `logIn` assertion would
  double the flake surface for zero added coverage. The files are still covered by the required
  `Linters & Tests` check via ESLint and Prettier.
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
  temporary by construction. Whoever makes the migrate-or-delete call on 2026-08-13 should weigh
  this cost against the −31% authoring saving: adopting CodeceptJS permanently means accepting an
  AI SDK, an MCP server SDK, and a beta package in the repo's dev tree indefinitely.
- **Playwright's `testMatch` is now pinned** to `**/*.spec.ts` so it can never collect the
  CodeceptJS `*_test.ts` files.
- **`.claude/rules/testing.md` says "use Playwright for end-to-end tests", which this trial
  contradicts.** The rule is intentionally left unchanged — Playwright remains the standard until
  this ADR is resolved. Whichever way the decision goes on 2026-08-13, that rule must be updated
  or the trial removed.
- **Not addressed here:** `apps/automated-tests/turbo.json` declares `test:e2e` inputs of
  `./tests/e2e/**/*.test.ts` and `playwright.config.json`, neither of which matches reality
  (`*.spec.ts`, `playwright.config.ts`), so that task's cache keys do not track its inputs. A
  pre-existing bug, out of scope, worth its own change.
