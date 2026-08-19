---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*_test.ts"
  - "**/__tests__/**/*"
  - "**/vitest.config.ts"
  - "**/codecept.conf.ts"
  - "apps/automated-tests/**/*"
---

# Testing

- Write test only for complex functions, core functionalities, not components.
- Use Vitest for unit tests and CodeceptJS for end-to-end tests.
- Keep unit tests next to the code using the repository's existing `*.test.ts` or
  `*.test.tsx` style.
- Cover success and expected failure paths for services and actions returning `Result`.
- Keep critical checkout, authentication, and search journeys in
  `apps/automated-tests`.
- Use `TEST_ENV_URL`, `LOCALE`, and configured credentials for CodeceptJS; never hardcode
  production URLs or secrets.
- Regenerate `apps/automated-tests/steps.d.ts` with `pnpm test:e2e:def` after changing a
  page object.
- Run the narrowest relevant test first, then `pnpm test`. Run `pnpm test:e2e` when the
  end-to-end suite is affected.
- Modified code must also pass staged linting, Prettier, and TypeScript checks.
