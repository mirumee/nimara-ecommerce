---
id: onboarding
title: Developer Onboarding
---

# Developer Onboarding

Welcome. This guide explains **why Nimara is built the way it is**, how the code is organized, and how you'll work in it day to day. Read this when you want to contribute, not just run a store.

:::tip
Just want to run a store? Start with [Running Locally](/Quickstart/running-locally) and [Storefront](/Quickstart/storefront). Come back when you want to write code.
:::

## What Nimara is for

Nimara is an **open, composable commerce platform** for teams who want SaaS-level speed without SaaS-level lock-in. The goal is simple:

- **Get a real storefront running in minutes** — even before you have a backend configured.
- **Own every line of code.** No closed cores, no required upgrades.
- **Swap any integration** — commerce backend, CMS, search, payments — without rewriting the app.
- **Grow from one storefront** into a multi-app monorepo (vendor panel, admin, internal tools) on the same foundation.

If a piece of the codebase ever feels over-engineered, ask _"could I swap this for something else next year?"_ That's usually the reason.

## Prerequisites

| Tool        | Version    | Notes                                                |
| ----------- | ---------- | ---------------------------------------------------- |
| **Node.js** | `24.x`     | Pinned in `.nvmrc`. Run `nvm use`.                   |
| **pnpm**    | `9.x`      | Only supported package manager.                      |
| **Git**     | any recent | Fork + upstream workflow (see CONTRIBUTING).         |
| **Docker**  | optional   | For a local Saleor or marketplace ledger/LocalStack. |

A **Saleor backend** is optional for a first look but needed for real work. A free [Saleor Cloud](https://docs.saleor.io/cloud/overview) developer account is the fastest path.

## Get it running

### Fork and clone

```bash
git clone https://github.com/{your_github_username}/nimara-ecommerce.git
cd nimara-ecommerce
git remote add upstream git@github.com:mirumee/nimara-ecommerce.git
```

### Install

```bash
pnpm install
```

Installs everything across the workspace.

### Optional: connect a backend

```bash
cp apps/storefront/.env.example apps/storefront/.env
```

The storefront is **zero-config** — skip this step and it still boots with empty data, useful for a first look. To talk to a real Saleor, edit `apps/storefront/.env` and set:

```properties
NEXT_PUBLIC_SALEOR_API_URL=https://{your_domain}.saleor.cloud/graphql/
```

Each extra variable turns on another capability (payments, marketplace, server-only resources). Run `pnpm preflight --report` at any time to see what's currently on or off.

### Run it

```bash
pnpm dev:storefront
```

Opens on [http://localhost:3000](http://localhost:3000). For webhooks and deployment, see the [Storefront guide](/Quickstart/storefront).

## How the codebase is organized

Nimara is a **layered monorepo**. Each layer has one job and only depends on layers below it. The rule sounds boring, but it's the reason you can swap backends and run zero-config: each piece only knows what it needs to know.

Each layer may use anything below it; nothing reaches up.

What each layer is for:

- **`domain`** — what your business cares about: types, rules, error shapes. Doesn't know about React, GraphQL, or any backend.
- **`infrastructure`** — the only place that talks to the outside world (Saleor, ButterCMS, Algolia, Stripe). Every external service hides behind a domain-typed contract.
- **`foundation`**, **`ui`**, **`i18n`** — shared building blocks: hooks, design system, translations.
- **`features`** — full vertical slices (checkout, search, account) ready to drop into an app.
- **`apps/`** — what users actually see: the storefront, marketplace, payment apps.

The full tour of every folder and the deeper conventions live in [`AGENTS.md`](https://github.com/mirumee/nimara-ecommerce/blob/main/AGENTS.md).

## The swap-anything promise

Saleor is the default commerce backend, but **nothing in the storefront or features layer knows that.** Every external system — backend, CMS, search, payment gateway — sits behind a domain-typed contract in `infrastructure`. The repo already proves this works: CMS pages have both a Saleor and a ButterCMS provider; search has both Saleor and Algolia.

What this buys you:

- **Change a CMS, not your codebase.** Adding a new provider means writing one adapter for that one capability. Your UI and feature code don't move.
- **Run before you commit.** No env vars? Every service returns empty data, the UI still renders, nothing crashes. You can show the project to a teammate in 60 seconds.
- **Errors look the same everywhere.** Every operation returns a `Result<T, E>` — no special path for "Saleor error" vs "Stripe error".
- **Pay for what you use.** Backend SDKs (`buttercms`, `algoliasearch`, …) are optional peers. If you don't use a provider, it's not in your bundle.

If you want to see exactly how this is wired in code, the cleanest example is the `cms-page` capability in `packages/infrastructure/src/cms-page/` — two providers, one shared port. The deeper write-up lives in `AGENTS.md`.

## How features turn on

The storefront boots **empty by default** and lights up as you add environment variables. One switch turns on most of the commerce surface; payment and marketplace are independent.

| When you set…                                                                        | You get…                                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Nothing                                                                              | Every page renders with empty data — great for design work or showing teammates.      |
| `NEXT_PUBLIC_SALEOR_API_URL`                                                         | The full commerce surface — cart, checkout, products, search, account.                |
| `NEXT_PUBLIC_MARKETPLACE_ENABLED=true`                                               | Vendor-aware behaviour for marketplaces.                                              |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` + `NEXT_PUBLIC_PAYMENT_APP_ID` | Payments.                                                                             |
| `SALEOR_APP_TOKEN`                                                                   | Server-side access to resources hidden from anonymous users (e.g. unpublished pages). |

Run `pnpm preflight` to see what's currently on. The full list of variables is in [Environment Variables](/Quickstart/environment-variables).

## Day-to-day workflow

```bash
pnpm dev:storefront        # one app (also: dev:marketplace, dev:stripe, dev:docs)
pnpm dev                   # everything

pnpm codegen               # regenerate GraphQL types after editing .graphql files
pnpm test                  # unit tests (Vitest)
pnpm test:e2e              # end-to-end (Playwright)

pnpm format                # Prettier
pnpm format:check          # what CI checks
```

### Branches and commits

- **Branch:** one per change, prefix with `contrib/` or `feat/`.
- **Internal flow:** `develop` → `staging` (QA) → `main` (production). External contributors open PRs from a fork.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/). Husky runs `lint-staged` on commit, so formatting is automatic. Run `pnpm exec cz` for a guided prompt.

### Before opening a PR

```bash
pnpm format:check
pnpm test
```

CI repeats both. Make sure they're green locally first.

## Conventions to know

A few minutes here saves a round of review comments.

- **`Result<T, E>` for expected failures.** Operations that can fail return a `Result` from `@nimara/domain/objects/Result` instead of throwing. Throw only for truly unexpected errors.
- **Named exports only.** Default exports are off by ESLint (Next.js route/page/layout files are exempt).
- **Type-only imports.** Write `import { type X }` when only types are needed.
- **Server Components by default.** Add `"use client"` only when you really need it. Mutations go through Server Actions. Parallelize independent fetches with `Promise.all`.
- **Forms.** `react-hook-form` + `zod`. Validate env vars with Zod too — never read server secrets from client code.
- **i18n.** Translations live in `@nimara/i18n` (`packages/i18n/src/messages/{locale}/`), composed by app via `createRequestConfig`. See `packages/i18n/AGENTS.md` to add a locale.
- **Dependencies.** Don't add one silently — propose it (why, alternatives, which package).

## Make your first change

### Pick the right layer

- Pure rule or type → `domain`
- Hook, helper, utility → `foundation`
- External API call → `infrastructure`
- Visual primitive (no logic) → `ui`
- A full feature (UI + state + logic) → `features`
- App-only glue → in the app

### Branch, build, test

```bash
git checkout -b contrib/my-first-change
pnpm codegen   # only if .graphql files changed
pnpm test
pnpm format
```

### Open a PR

Push, open a PR against `develop`, give it a Conventional Commit title and a clear description. A maintainer takes it from there.

## Where to go next

- **[Running Locally](/Quickstart/running-locally)** — backend setup options.
- **[Storefront](/Quickstart/storefront)** — full setup, webhooks, deployment.
- **[Environment Variables](/Quickstart/environment-variables)** — every configurable variable.
- **[Saleor CMS](/Quickstart/saleor-cms)** & **[Add a new channel](/Quickstart/add-new-channel)** — content and markets.
- **[Stripe](/Integrations/stripe-integration)**, **[UCP](/Integrations/ucp-integration)**, **[Marketplace](/Advanced/marketplace)** — integrations and advanced apps.
- `AGENTS.md` and `CONTRIBUTING.md` in the repo root — deeper conventions and the contribution process.
