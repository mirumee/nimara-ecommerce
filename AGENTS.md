# Nimara E‑commerce — AI Agent Roles

**Version 1.0.0**
Nimara (Mirumee)
February 2026

> **Note:**
> This document defines roles and instructions for AI agents and LLMs working in this repository.
> Guidance is optimized for automation and consistency; humans may use it for onboarding and conventions.

---

## Abstract

Nimara is an open-source, composable commerce ecosystem for building **storefronts** and **marketplaces**. It is designed for enterprise and startup engineering teams who want:

- **SaaS-level speed to start** - Get up and running quickly
- **Full ownership and control** - Own your code, no vendor lock-in
- **Modular architecture** - Replaceable integrations and features
- **Clean monorepo structure** - Enable multiple frontends and backend components

---

## The North Star

A developer should be able to:

1. **Create a new project quickly** - Minimal setup, maximum productivity
2. **Add storefront and integrations incrementally** - Start simple, grow as needed
3. **Run locally with minimal config** - Dummy profiles work out of the box
4. **Override only what they need** - No forking required
5. **Deploy with predictable infra scripts** - Terraform modules included
6. **Expand into multi-app monorepo** - Vendor panel, admin panel, services

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Lead Developer](#1-lead-developer)
3. [Frontend Expert](#2-frontend-expert)
4. [DevOps / Infra](#3-devops--infra)
5. [QA / Testing](#4-qa--testing)
6. [Cross-Cutting Rules](#5-cross-cutting-rules)

---

## Architecture Overview

Nimara uses a **layered monorepo** with strict dependency boundaries to keep code maintainable and reusable.

**For detailed guidance on package layers, dependency direction, and architectural decisions, see the `.agents/skills/project-guidelines/SKILL.md` skill.**

### Layers

```
apps/
├── storefront/              # Next.js 16 customer storefront
├── stripe/                  # Stripe payment integration app
└── automated-tests/         # Playwright E2E tests

packages/
├── domain/                  # Pure business logic (types, consts, entities)
├── foundation/              # Utilities, hooks, helpers
├── infrastructure/          # External API integrations (Saleor, ButterCMS, etc.)
├── features/                # Feature implementations (UI + logic + state)
├── ui/                      # Shared UI components (Shadcn-style)
└── config/                  # Shared configs (Tailwind, ESLint, PostCSS)
```

### Dependency Flow

```
domain (leaf)
   ↑
foundation (leaf)
   ↑
infrastructure ─┐
   ↑             │
ui (leaf)       ├→ features ──→ apps
   ↑             │
   └─────────────┘
```

**Key rules:**

- Apps depend on: `features`, `infrastructure`, `ui`, `foundation`, `domain`
- Features depend on: all packages
- Infrastructure depends on: `domain`, `foundation` only
- Foundation & domain are **leaf packages** (depend on nothing from Nimara)

For decision tree and detailed scenarios, see `.agents/skills/project-guidelines/SKILL.md`.

---

## 1. Lead Developer

**Domain:** Architecture, cross-package boundaries, consistency, refactors, and technical decisions.

**Goals:**

- Keep **domain** pure (types, DTOs, consts); no framework or infra imports.
- Keep **infrastructure** implementing domain use-cases (GraphQL, APIs, serializers); apps depend on infrastructure, not Saleor schema directly.
- Enforce **no `@/app` imports from `@/components`** and **no `@nimara/codegen`** in app/component code; use `@nimara/domain` and infrastructure services.
- Ensure **Result<T, E>** from `@nimara/domain/objects/Result` is used for operations that can fail; avoid throwing for expected business errors in services.
- **Never automatically add dependencies** — always ask for approval first and provide alternatives.

**Repo-specific instructions:**

1. **Monorepo layout**
   - `apps/storefront` — Next.js 16 storefront (main app).
   - `apps/stripe` — Next.js Stripe payment app (Saleor Payment Gateway).
   - `apps/docs` — Nextra docs; `apps/automated-tests` — Playwright e2e.
   - `packages/domain` — shared types/objects/consts only (leaf package).
   - `packages/foundation` — utilities, hooks, helpers (leaf package).
   - `packages/infrastructure` — use-cases, GraphQL, providers (Saleor, ButterCMS, Algolia, etc.).
   - `packages/features` — feature implementations combining UI + logic + state.
   - `packages/ui` — shared UI (Shadcn-style); `packages/config` — Tailwind/PostCSS; `packages/codegen` — GraphQL codegen.

2. **Dependency direction (CRITICAL)**
   - Apps → `@nimara/features`, `@nimara/infrastructure`, `@nimara/ui`, `@nimara/foundation`, `@nimara/domain`, `@nimara/config`.
   - Features → all packages (it's the composition layer).
   - Infrastructure → `@nimara/domain`, `@nimara/foundation` only.
   - Foundation & domain are **leaf packages** (import only from each other or stdlib).
   - See `.agents/skills/project-guidelines/SKILL.md` for decision tree.

3. **Default exports**
   - Base ESLint disallows default exports. Next.js app routes/pages/layouts are exempt via `eslint-config-custom/next.js`. Use named exports everywhere else (including `packages/ui` unless a file is explicitly exempt).

4. **Branch workflow**
   - Feature work from `develop`; merge to `staging` for QA; production via `main`. PRs target `develop` unless hotfix.

5. **When adding a new use-case**
   - Define types in `packages/domain` or under the feature in `packages/infrastructure/use-cases`.
   - Implement in `packages/infrastructure` (e.g. `saleor/`, `butter-cms/`) with GraphQL/infra; expose via providers. Consume in apps via services (e.g. `getUserService()`, `cmsPageService`).
   - Wrap operations in `Result<T, E>` for proper error handling.

6. **Dependency approval workflow**
   - Before adding any new dependency: ask for approval and provide alternatives.
   - Explain why the dependency is needed and which package it goes to.
   - Wait for explicit confirmation before running `pnpm add`.
   - See `.agents/skills/project-guidelines/SKILL.md` "Dependency Management" section.

---

## 2. Frontend Expert

**Domain:** Storefront and Stripe app UI: Next.js App Router, React Server Components, Client Components, Tailwind, `@nimara/ui`, forms, i18n, and performance.

**Goals:**

- Prefer **Server Components**; add `"use client"` only when needed (interactivity, hooks, browser APIs).
- Use **Server Actions** (`"use server"`) for mutations; authenticate and authorize like API routes; return **Result**-like values; use `revalidatePath` / `revalidateTag` for cache invalidation.
- Avoid waterfalls: use **Promise.all** for independent async work in RSC and in Server Actions; structure layout/page so data fetches can run in parallel.
- Follow **Vercel React/Next.js** performance rules (see `.agents/skills/vercel-react-best-practices`): no barrel imports for app code, dynamic imports for heavy client components, minimal serialization over RSC boundary.
- Follow **composition patterns** from `.agents/skills/vercel-composition-patterns`: avoid boolean prop proliferation; use compound components and composition over render props where it fits.

**Repo-specific instructions:**

1. **App Router structure (storefront)**
   - Routes under `src/app/[locale]/` with route groups: `(main)`, `(checkout)`, `(auth)`.
   - Layouts are async; fetch data in layout when needed for shell (e.g. menu, region). Use `CACHE_TTL` and `next: { tags, revalidate }` from `@/config` for fetch cache.
   - Use `revalidateTag` from `@/lib/cache` (wraps `next/cache`) for webhook-driven invalidation; tags follow project convention (e.g. `CMS:navbar`, `ACP:CHECKOUT_SESSION:id`).

2. **Components**
   - Use `@nimara/ui` for shared primitives (Button, Input, Modal, etc.).
   - Use `@nimara/features` for feature-specific components (Checkout, ProductSearch, etc.).
   - Keep components under 200 lines; split into smaller composable pieces.
   - Use compound components pattern for flexible, prop-drilling-free components.

3. **Tailwind**
   - Config comes from `@nimara/config/tailwind`; storefront uses `config("storefront")`. Use **utility-first** classes; prefer design tokens (e.g. `hsl(var(--background))`) and theme values from shared config. Prettier sorts classes via `prettier-plugin-tailwindcss`.

4. **Env and config**
   - Client envs: validate with **Zod** in `src/envs/client.ts` and export a single parsed object. Server-only envs in `src/envs/server.ts`. Do not read server secrets in client code.

5. **Services in storefront**
   - Services are lazy-initialized (e.g. `cmsPageService`, `cmsMenuService`, `getUserService()`). Use them in RSC or Server Actions; do not import from `@nimara/codegen` in app or components.
   - Services wrap infrastructure calls with Result pattern for proper error handling.

6. **Forms and Server Actions**
   - Use **react-hook-form** with **Zod** (e.g. `@hookform/resolvers/zod`). Server Actions live next to the feature (e.g. `_forms/actions.ts`, `_actions/`). Always `getAccessToken()` (or equivalent) in protected actions and pass it to infrastructure services.
   - Return Result-like objects from Server Actions so client can handle errors properly.

7. **i18n**
   - `next-intl`; translations in `messages/`. Use `getTranslations` in Server Components and `useTranslations` in Client Components.

8. **React 19**
   - Project uses React 19. Prefer not using `forwardRef` where possible; follow patterns in `.agents/skills/vercel-composition-patterns` for refs (e.g. `use()` if applicable).
   - Use `use()` hook instead of `useContext()` (can be called conditionally).

---

## 3. DevOps / Infra

**Domain:** CI/CD, Turborepo, deployment (Vercel), Terraform, envs, and build/cache.

**Goals:**

- Keep **Turbo** task graph correct: `codegen` before `build` where needed; avoid unnecessary dependencies.
- CI runs **ESLint** (with cache), **Prettier** (format:check), and **tests** on PRs and on push to `develop`/`staging`. Ensure new packages/apps are covered.
- Env and secrets: use **Vercel** envs per environment; document required vars in `.env.example` and in docs. Never commit secrets.

**Repo-specific instructions:**

1. **Tooling**
   - Node **22.x**; package manager **pnpm**; `turbo` for runs. Root scripts: `build`, `dev`, `test`, `format`, `format:check`, `codegen`. Per-app scripts (e.g. `dev:storefront`, `build:storefront`) use `pnpm run … --filter=storefront`.

2. **CI (GitHub Actions)**
   - Main workflow: lint (ESLint on changed `.ts`/`.tsx` for PRs, all on push), Prettier check, tests. Use `pnpm install --frozen-lockfile`.

3. **Deployment**
   - Vercel: `develop`, `staging`, `main` map to environments. Terraform examples in `terraform/storefront/`. Use `globalPassThroughEnv` in `turbo.json` for build-time envs that must reach Vercel.

4. **Sentry**
   - Storefront and Stripe use Sentry; config in `sentry.*.config.ts`. Error service in storefront sets user context on server and passes minimal user info to client for reporting.

---

## 4. QA / Testing

**Domain:** Unit tests (Vitest), e2e (Playwright), and quality gates.

**Goals:**

- New features and use-cases should have **unit tests** where logic is non-trivial (e.g. lib, services, actions).
- **E2E** coverage for critical flows (checkout, auth, search) in `apps/automated-tests`; keep Playwright config and env (e.g. `TEST_ENV_URL`) aligned with staging.

**Repo-specific instructions:**

1. **Vitest**
   - Used in storefront and stripe; config per app. Place tests next to code or in `*.test.ts` / `__tests__` as per existing style.

2. **Playwright**
   - E2E in `apps/automated-tests`; run with `pnpm test:e2e`. Use `TEST_ENV_URL` and test credentials; do not hardcode production URLs.

3. **Linting and types**
   - All modified code must pass ESLint and Prettier. TypeScript strict; fix type errors before marking task complete.

4. **Result handling**
   - In tests, assert on `result.ok` and `result.data` or `result.errors`; cover both success and expected failure paths for services/actions that return `Result`.

---

## 5. Cross-Cutting Rules

**All agents:**

1. **Imports**
   - Use **type-only** imports where only types are needed: `import type { X } from "..."` (enforced by ESLint `@typescript-eslint/consistent-type-imports` with inline type imports).
   - **Import order**: side-effect → node → packages → `@nimara` → `@/` → relative (see `simple-import-sort` in `packages/eslint-config-custom/base.js`).

2. **Async and errors**
   - Prefer `Promise.all` for independent async work. In try/catch, use `return await` (ESLint `@typescript-eslint/return-await` in try-catch).
   - Use **Result** from domain for expected failures; throw only for truly unexpected cases. In Server Actions, return Result-like objects so the client can show field errors or messages.

3. **Files and naming**
   - **Conventional Commits** for commits (e.g. `feat:`, `fix:`, `docs:`). Use `contrib/` or `feat/` branch prefix as in CONTRIBUTING.

4. **Dependencies (CRITICAL)**
   - **NEVER automatically add dependencies.** Always ask for approval first with alternatives.
   - See `.agents/skills/project-guidelines/SKILL.md` "Dependency Management" section for approval workflow.
   - After approval, verify installation: check `package.json`, verify `pnpm.lock` changes.

5. **Documentation**
   - When adding env vars or deployment steps, update `.env.example` or docs in `apps/docs` as appropriate. Keep README and CONTRIBUTING accurate.

6. **Skills and rules**
   - For **architecture and layers:** See `.agents/skills/project-guidelines/SKILL.md` (decision tree, common scenarios).
   - For **React/Next.js patterns:** Follow `.agents/skills/vercel-react-best-practices` and `.agents/skills/vercel-react-best-practices`.
   - For **composition patterns:** See `.agents/skills/vercel-composition-patterns` (avoid boolean props, use compound components).
   - For **UI/accessibility:** See `.agents/skills/web-design-guidelines` when relevant.
   - Use the **SKILLS.md** in this repo for a concise catalog of technical standards and patterns.

---

## Quick Reference: When to Use Each Skill

| Task                         | Skill                                                                   | Why                                  |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| Where does this code belong? | `.agents/skills/project-guidelines/SKILL.md`                            | Decision tree + layers explanation   |
| Add new dependency           | `.agents/skills/project-guidelines/SKILL.md`                            | Approval workflow (NEVER automatic)  |
| Optimize React component     | `.agents/skills/vercel-react-best-practices/SKILL.md`                   | Performance patterns                 |
| Refactor component props     | `.agents/skills/vercel-composition-patterns/SKILL.md`                   | Avoid boolean props, use composition |
| Review UI/design             | `.agents/skills/web-design-guidelines/SKILL.md`                         | Accessibility, usability             |
| Understand architecture      | `.AGENTS.md` (this file) + `.agents/skills/project-guidelines/SKILL.md` | Overall structure + details          |
