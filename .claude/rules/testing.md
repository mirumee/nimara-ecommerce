---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/__tests__/**/*"
  - "**/vitest.config.ts"
  - "**/playwright.config.ts"
  - "apps/automated-tests/**/*"
---

# Testing

- Use Vitest for unit tests and Playwright for end-to-end tests.
- Keep unit tests next to the code using the repository's existing `*.test.ts` or
  `*.test.tsx` style.
- Cover success and expected failure paths for services and actions returning `Result`.
- Keep critical checkout, authentication, and search journeys in
  `apps/automated-tests`.
- Use `TEST_ENV_URL` and configured credentials for Playwright; never hardcode
  production URLs or secrets.
- Run the narrowest relevant test first, then `pnpm test`. Run `pnpm test:e2e` when the
  end-to-end suite is affected.
- Modified code must also pass staged linting, Prettier, and TypeScript checks.
