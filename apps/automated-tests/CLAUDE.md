# Automated tests

This workspace contains Playwright end-to-end coverage for the deployed storefront.

## Local structure

- Specs live in `tests/e2e/`, shared fixtures in `fixtures/`, and page objects in `pages/`.
  Put reusable interaction sequences in page objects instead of duplicating selectors.
- Import the extended `test` and `expect` from `fixtures/fixtures.ts` when a page fixture is
  needed.
- `TEST_ENV_URL` is required and becomes Playwright's `baseURL`; credentials come from
  `USER_EMAIL` and `USER_PASSWORD`. Never hardcode live credentials or production URLs.
- Keep tests independent and parallel-safe. CI runs Chrome, Firefox, and Safari with
  retries, so do not depend on execution order or shared mutable state.

## Commands

- Full suite: `pnpm test:e2e`
- One spec: `pnpm --filter automated-tests test:e2e -- tests/e2e/<path>.spec.ts`
