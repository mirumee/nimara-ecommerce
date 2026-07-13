---
type: "Technical Reference"
title: "Local Development & Workflow"
description: "Prerequisites, fork/install/run, the day-to-day command set, branch/commit conventions, and code conventions for working in the Nimara monorepo."
tags:
  - "nimara"
  - "onboarding"
  - "workflow"
  - "local-development"
  - "reference"
resource: "/sources/nimara-docs/onboarding.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/onboarding.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

How to get Nimara running locally and work in it day to day (source: [onboarding](/sources/nimara-docs/onboarding.mdx), [running-locally](/sources/nimara-docs/running-locally.md)).

### Prerequisites
| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | `24.x` | Pinned in `.nvmrc`; run `nvm use`. |
| pnpm | `9.x` | The only supported package manager. |
| Git | any recent | Fork + upstream workflow. |
| Docker | optional | For a local Saleor or the marketplace ledger / LocalStack. |

A Saleor backend is optional for a first look but needed for real work; a free [Saleor Cloud](https://docs.saleor.io/cloud/overview) developer account is the fastest path. Saleor can also be [run locally](https://docs.saleor.io/quickstart/running-locally) via Docker. See [Running Locally source](/sources/nimara-docs/running-locally.md).

### Get it running
```bash
git clone https://github.com/{your_github_username}/nimara-ecommerce.git
cd nimara-ecommerce
git remote add upstream git@github.com:mirumee/nimara-ecommerce.git
pnpm install                     # installs across the workspace
cp apps/storefront/.env.example apps/storefront/.env   # optional: connect a backend
pnpm dev:storefront              # http://localhost:3000
```
The storefront is **zero-config** — skip the `.env` step and it still boots with empty data. To talk to a real Saleor, set `NEXT_PUBLIC_SALEOR_API_URL` in `apps/storefront/.env`. Each extra variable turns on another capability; run `pnpm preflight` to see what's on. See [Environment Variables](/tech/nimara/Environment%20Variables.md).

### Day-to-day commands
```bash
pnpm dev:storefront   # one app (also dev:marketplace, dev:stripe, dev:docs)
pnpm dev              # everything
pnpm codegen          # regenerate GraphQL types after editing .graphql files
pnpm test             # unit tests (Vitest)
pnpm test:e2e         # end-to-end (Playwright)
pnpm format           # Prettier
pnpm format:check     # what CI checks
```

### Branches and commits
- **Branch:** one per change, prefixed `contrib/` or `feat/`.
- **Internal flow:** `develop` → `staging` (QA) → `main` (production); external contributors open PRs from a fork. See [Release Workflow](/tech/nimara/Release%20Workflow.md).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/); Husky runs `lint-staged` on commit. `pnpm exec cz` gives a guided prompt.
- **Before a PR:** run `pnpm format:check` and `pnpm test` (CI repeats both); open against `develop`.

### Conventions to know
- **`Result<T, E>` for expected failures** — operations that can fail return a `Result` from `@nimara/domain/objects/Result` rather than throwing; throw only for truly unexpected errors.
- **Named exports only** — default exports are off by ESLint (Next.js route/page/layout files exempt).
- **Type-only imports** — write `import { type X }` when only types are needed.
- **Server Components by default** — add `"use client"` only when needed; mutations go through Server Actions; parallelize independent fetches with `Promise.all`.
- **Forms** — `react-hook-form` + `zod`; validate env vars with Zod; never read server secrets from client code.
- **i18n** — translations live in `@nimara/i18n`; see [Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md).
- **Dependencies** — never add one silently; propose it (why, alternatives, which package).

### Picking the right layer for a change
Pure rule or type → `domain`; hook/helper/utility → `foundation`; external API call → `infrastructure`; visual primitive → `ui`; full feature (UI + state + logic) → `features`; app-only glue → in the app. See [Platform Overview](/tech/nimara/Platform%20Overview.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Platform Overview](/tech/nimara/Platform%20Overview.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Release Workflow](/tech/nimara/Release%20Workflow.md)
[Storefront](/tech/nimara/Storefront.md)
