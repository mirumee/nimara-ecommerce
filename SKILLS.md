# Nimara E‑commerce — Technical Skills & Standards

**Version 1.0.0**  
Nimara (Mirumee)  
February 2026

> **Note:**  
> This document catalogs technical skills, coding standards, and design patterns used in this repository.  
> It is intended for AI agents and LLMs to generate and review code consistently. Use **AGENTS.md** for role-specific behavior.

---

## Table of Contents

1. [Tech Stack Summary](#1-tech-stack-summary)
2. [Language & Linting](#2-language--linting)
3. [Project Structure & Architecture](#3-project-structure--architecture)
4. [Next.js App Router & React Server Components](#4-nextjs-app-router--react-server-components)
5. [State, Data Fetching & Caching](#5-state-data-fetching--caching)
6. [Error Handling & Result Type](#6-error-handling--result-type)
7. [Styling (Tailwind CSS)](#7-styling-tailwind-css)
8. [Forms, Validation & Server Actions](#8-forms-validation--server-actions)
9. [GraphQL & Codegen](#9-graphql--codegen)
10. [Testing](#10-testing)

---

## 1. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Runtime / PM | Node 22.x, pnpm 9.x |
| Monorepo | Turborepo |
| Storefront | Next.js 15 (App Router), React 19, TypeScript |
| Stripe app | Next.js (App Router), TypeScript |
| Docs | Nextra (MDX) |
| UI | Tailwind CSS, Shadcn-style components (`packages/ui`), next-themes |
| Forms | react-hook-form, Zod, @hookform/resolvers |
| i18n | next-intl |
| Data | Saleor GraphQL, ButterCMS, Algolia (optional), Stripe API |
| Observability | Sentry, Vercel Speed Insights, OpenTelemetry |
| Tests | Vitest (unit), Playwright (e2e) |
| Lint / Format | ESLint (custom config), Prettier, prettier-plugin-tailwindcss |

---

## 2. Language & Linting

### 2.1 TypeScript

- **Strict** mode; no `any` in new code when avoidable (project may have legacy `@typescript-eslint/no-explicit-any` off).
- **Type-only imports**: use `import type { X } from "..."` when only types are needed (enforced by `@typescript-eslint/consistent-type-imports` with inline-type-imports).
- Unused vars/args: allowed only if prefixed with `_` (`argsIgnorePattern`, `varsIgnorePattern`).
- **Template expressions**: numbers and booleans allowed in template strings; other types must be explicit.
- **Async**: `return await` required inside try/catch (`@typescript-eslint/return-await`); `require-await` off.

### 2.2 ESLint (custom config)

- Base: `packages/eslint-config-custom/base.js`.
- Next.js apps: extend `custom/next`; **default export allowed only** for Next.js entry files (pages, layouts, route handlers).
- **Import order**: `simple-import-sort` — order: side-effect → `node:` → packages → `@nimara` → `@/` → relative.
- **No default export** in non-Next code (e.g. packages, lib, components) unless explicitly disabled in that file/override.
- **No mutable exports** (`import/no-mutable-exports`), **no import cycles** (`import/no-cycle`).
- **Curly** required for control flow; **newline-before-return**, **newline-after-var**; **nonblock-statement-body-position**.
- **Storefront overrides**: no `@/app` imports from `src/components`; no `@nimara/codegen` in `src/**` (use domain/infrastructure).
- Ignored for lint: `generated.ts`, `tailwind.config.*`, `next-env.d.ts`, certain legacy paths.

### 2.3 Prettier

- **Semi**: true; **singleQuote**: false; **trailingComma**: "all".
- **prettier-plugin-tailwindcss**: class order/sorting for Tailwind utility classes.
- Run: `pnpm format` (write), `pnpm format:check` (CI).

---

## 3. Project Structure & Architecture

### 3.1 Clean Architecture (simplified)

- **Domain** (`packages/domain`): shared types, DTOs, constants, Result type. **No** dependency on Next.js, GraphQL, or infrastructure.
- **Infrastructure** (`packages/infrastructure`): use-cases, GraphQL clients, API clients, serializers, providers (Saleor, ButterCMS, Algolia, Stripe). Depends on domain; exposes services and types.
- **Apps**: depend on `@nimara/domain`, `@nimara/infrastructure`, `@nimara/ui`, `@nimara/config`. **Must not** import `@nimara/codegen` (Saleor schema) in app/component code to avoid coupling.

### 3.2 Storefront app layout

- `src/app` — App Router: `[locale]`, route groups `(main)`, `(checkout)`, `(auth)`, `api/`.
- `src/components` — reusable UI (header, footer, forms, error-service, etc.).
- `src/services` — lazy-initialized service instances (cms, user, cart, checkout, etc.) that wrap infrastructure use-cases.
- `src/lib` — utilities, actions helpers, cache, paths, formatters, server helpers.
- `src/regions` — server/client region and locale (e.g. `getCurrentRegion()`, `use-current-region`).
- `src/envs` — Zod-validated client and server env.
- Feature-specific modules under `src` (e.g. `pdp/`, `middlewares/`).

### 3.3 Naming and file conventions

- **Route groups**: `(main)`, `(checkout)`, `(auth)` — no segment in URL.
- **Private folders**: `_components`, `_forms`, `_actions`, `_sections`, `_modals`, `_tabs` — not routes.
- **Server Actions**: colocated in `actions.ts` or `_actions/` with `"use server"` at top of file.
- **Loading/error UI**: `loading.tsx`, `error.tsx` next to route segments as per Next.js.

---

## 4. Next.js App Router & React Server Components

### 4.1 Default to Server Components

- **Do not** add `"use client"` unless the module uses hooks, event handlers, browser APIs, or context that requires client execution.
- Keep data fetching and layout logic in Server Components; pass minimal serializable props to Client Components.

### 4.2 Data fetching in RSC

- Fetch in **layout** or **page**; use **Promise.all** for independent requests to avoid waterfalls.
- Attach cache via `options.next`: `{ tags: ["Tag:name"], revalidate: CACHE_TTL.xxx }` (from `@/config`). Use consistent tag names (e.g. `CMS:navbar`, `CMS:home`, `ACP:CHECKOUT_SESSION:id`).
- Prefer **tags + revalidate** over ad-hoc numbers when the same data can be invalidated by webhooks (e.g. Saleor webhooks call `revalidateTag`).

### 4.3 Client Components

- Add `"use client"` at the top of the file.
- Prefer **composition**: small client islands (e.g. variant selector, modals, forms) rather than one big client page.
- For heavy or below-the-fold UI, consider **dynamic import** with `next/dynamic` to reduce initial bundle (align with Vercel bundle guidelines).

### 4.4 Server Actions

- Mark file with `"use server"`.
- **Auth**: call `getAccessToken()` (or equivalent) at the start of protected actions; pass token to infrastructure services.
- **Return** Result-like objects `{ ok: true, data }` or `{ ok: false, errors }` so the client can show success/field errors without throwing.
- **Revalidation**: use `revalidatePath` or `revalidateTag` (from `@/lib/cache`) after mutations that change displayed data.
- **Idempotency / validation**: validate input (e.g. Zod) and check permissions before calling infrastructure.

### 4.5 Route handlers (API)

- Use for webhooks, auth callbacks, and small API endpoints. Start async work early where possible; await only when needed (avoid waterfalls).
- Webhooks (e.g. Saleor): verify payload, then call `revalidateTag` for affected tags and return 200 quickly.

---

## 5. State, Data Fetching & Caching

### 5.1 Server state

- **RSC**: data is fetched in server components; no client-side fetch for initial page data unless intentionally client-driven (e.g. search filters).
- **Cache**: Next.js fetch cache with `revalidate` and `tags`; invalidate via `revalidateTag` in API routes or Server Actions.

### 5.2 Client state

- Prefer **URL state** for shareable UI (e.g. search params) — e.g. `nuqs` in this project.
- **React state**: for local UI (modals, form draft). Avoid lifting state higher than needed; consider composition (see vercel-composition-patterns).
- **No global client store** for server data in the current setup; server data is refetched via revalidation or new requests.

### 5.3 Caching constants (storefront)

- `CACHE_TTL` in `src/config.ts`: e.g. `pdp`, `cart`, `cms` (in seconds). Use these in fetch options so cache behavior is consistent and tunable in one place.

---

## 6. Error Handling & Result Type

### 6.1 Result type (domain)

- `Result<T, E>` from `@nimara/domain/objects/Result`: `Ok<T> = { ok: true, data: T }`, `Err<E> = { ok: false, errors: NonEmptyArray<E> }`.
- Use **Result** for expected failures (validation, business rules, API errors). Use **err()** and **ok()** helpers.
- In Server Actions and services, return Result so the client can branch on `result.ok` and show `result.errors` or field errors.

### 6.2 Unexpected errors

- **Sentry**: used in storefront and Stripe; server sets user context where available. Let unexpected errors propagate to boundary or global error handler so Sentry can capture them.
- **Error boundaries**: use `error.tsx` and `global-error.tsx` for graceful UI; avoid swallowing errors that should be reported.

### 6.3 Logging

- Use the project logger (e.g. `storefrontLogger`) for structured logs; do not rely on `console.log` in production paths.

---

## 7. Styling (Tailwind CSS)

### 7.1 Config

- Tailwind is configured in **packages/config** (`tailwind.config.ts`); apps call `config("storefront")` or `config("stripe")`. Content paths include `packages/ui` and app `src`.
- **Dark mode**: `class` (toggle via next-themes or similar).
- **Design tokens**: use CSS variables for colors (e.g. `hsl(var(--background))`, `hsl(var(--primary))`). Custom screens, font sizes, and radii are defined in shared config.

### 7.2 Utility-first rules

- Prefer **utility classes** over custom CSS; use existing theme values (e.g. `text-muted-foreground`, `bg-card`, `rounded-lg`).
- **Responsive**: use `sm:`, `md:`, `lg:` breakpoints from config (e.g. `xs: 360px`, `sm: 720px`).
- **No arbitrary values** unless necessary; prefer semantic tokens (e.g. `var(--radius)`).
- **Class order**: managed by Prettier + prettier-plugin-tailwindcss; run format to keep order consistent.

### 7.3 Components (packages/ui)

- Shared components (Button, Card, Dialog, Form, etc.) live in `packages/ui`; they use Tailwind and shared design tokens. Use these instead of duplicating styles in apps when possible.

---

## 8. Forms, Validation & Server Actions

### 8.1 Client forms

- **react-hook-form** for form state; **Zod** for schema; **@hookform/resolvers/zod** to wire them.
- Keep schema in a `schema.ts` next to the form (or in `_forms/`); share types with Server Actions when needed.

### 8.2 Server Actions

- Validate input with the same (or a subset of) Zod schema in the action before calling services.
- Call `getAccessToken()` for protected actions; pass token to `getUserService()` or other infrastructure.
- Return a Result-like shape so the client can show success or field errors without relying on thrown errors for normal flows.

---

## 9. GraphQL & Codegen

### 9.1 Where GraphQL lives

- **Infrastructure**: `.graphql` files and generated clients live under `packages/infrastructure` (and in `apps/stripe` for Stripe-specific GraphQL). Codegen output is in `generated.ts` (often ignored by ESLint).
- **Storefront**: GraphQL under `apps/storefront/src/graphql` for storefront-specific queries/fragments; codegen per app.

### 9.2 Usage in app code

- **Do not** import from `@nimara/codegen` in storefront `src` (or from Saleor schema types in app/component code). Use **domain** types and **infrastructure** use-case interfaces so the app stays decoupled from the GraphQL schema.

### 9.3 Codegen

- Run **pnpm codegen** (or turbo codegen) when changing `.graphql` or schema; CI and build pipelines assume codegen has been run where required (e.g. `turbo` build depends on codegen).

---

## 10. Testing

### 10.1 Unit (Vitest)

- Storefront and Stripe use Vitest; config in app root (e.g. `vitest.config.ts`).
- Test **services**, **lib** helpers, **actions** (with mocks for infrastructure), and **pure logic**. Prefer testing behavior and outcomes (e.g. Result) rather than implementation details.

### 10.2 E2E (Playwright)

- **apps/automated-tests**: Playwright; run with `pnpm test:e2e`. Use `TEST_ENV_URL` and test credentials; no production URLs in tests.

### 10.3 Quality gates

- All changes must pass **ESLint** and **Prettier**. TypeScript must compile without errors. Fix lint/type errors before considering the task done.

---

## Quick Reference: Where to Look

| Need | Location |
|------|----------|
| Agent roles and repo rules | **AGENTS.md** (this repo) |
| React/Next performance rules | `.agents/skills/vercel-react-best-practices` |
| Composition and compound components | `.agents/skills/vercel-composition-patterns` |
| UI/accessibility review | `.agents/skills/web-design-guidelines` |
| ESLint base config | `packages/eslint-config-custom/base.js` |
| Next-specific ESLint | `packages/eslint-config-custom/next.js` |
| Tailwind theme | `packages/config/src/tailwind.config.ts` |
| Storefront config (cache, cookies) | `apps/storefront/src/config.ts` |
| Env validation (storefront) | `apps/storefront/src/envs/client.ts`, `server.ts` |
| Result type | `packages/domain/src/objects/Result.ts` |
