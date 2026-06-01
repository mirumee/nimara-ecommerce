# Nimara — GitHub Copilot instructions

**Single source of truth:** the canonical guidance for this repo lives in
[`AGENTS.md`](../AGENTS.md) and the skills under [`.agents/skills/`](../.agents/skills/).
This file is a thin pointer — it is intentionally short so the rules don't drift across
tools.

## Stack

Next.js 16 (App Router, RSC, Server Actions) · React 19 · TypeScript strict · Tailwind +
Shadcn UI · Saleor GraphQL (GraphQL Code Generator) · Turborepo + pnpm · NextAuth v5 ·
Stripe · Vitest (unit) + Playwright (E2E) · Vercel · Sentry · Pino.

## Structure (authoritative)

```
apps/
  storefront/        # Next.js customer storefront (main app)
  marketplace/       # Vendor dashboard; Stripe Connect, optional Postgres ledger
  stripe/            # Stripe payment app (Saleor Payment Gateway)
  docs/              # Docusaurus docs site
  automated-tests/   # Playwright E2E
packages/
  domain/            # Pure business logic, types, Result (leaf)
  foundation/        # Utilities, hooks, helpers (leaf)
  infrastructure/    # External integrations (Saleor, ButterCMS, Algolia, …)
  features/          # Feature implementations (UI + logic + state)
  ui/                # Shared Shadcn-style UI
  config/            # Shared Tailwind/PostCSS/ESLint config
  codegen/           # GraphQL codegen
  i18n/              # Internationalization
  eslint-config-custom/  # Shared ESLint configs
```

- `domain` & `foundation` are leaf packages.
- `infrastructure` depends on `domain` + `foundation` only.
- `features` composes all packages; apps depend on features/infrastructure/ui/foundation/domain/config.

## Rules that matter most

- **Server Components first** — `"use client"` only for interactivity, hooks, or browser
  APIs. Mutations use Server Actions with `revalidatePath`/`revalidateTag`.
- **Result pattern** — wrap fallible ops in `Result<T, E>` from `@nimara/domain/objects/Result`.
- **Codegen** — run `pnpm codegen` after any `.graphql` change; never hand-write generated types.
- **Named exports only** (Next route/page/layout files exempt).
- Never import `@nimara/codegen` from app/component code — use services.
- **NEVER add a dependency automatically** — propose it with alternatives and wait for approval.

## Where to look

| Need | Read |
| --- | --- |
| Layers, where code belongs, data flow | `.agents/skills/project-guidelines/SKILL.md` |
| React/Next performance | `.agents/skills/vercel-react-best-practices` |
| Component composition | `.agents/skills/vercel-composition-patterns` |
| UI / accessibility | `.agents/skills/web-design-guidelines` |
| Turborepo / build system | `.agents/skills/turborepo` |
| Roles, conventions, full guidance | `AGENTS.md` |

## Commands

```bash
pnpm dev:storefront   # dev server
pnpm codegen          # regenerate GraphQL types
pnpm test             # Vitest
pnpm format:check     # Prettier
turbo run lint:staged # lint changed files
```

Git flow: feature branch → `develop` → `staging` (QA) → `main` (prod). Conventional Commits.
