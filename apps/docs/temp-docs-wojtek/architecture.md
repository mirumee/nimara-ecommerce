# Architecture (Nimara Commerce OS)

This document defines the **project architecture, layering rules, and extension points** for the Nimara monorepo.
It is intended as a “single source of truth” for contributors and tools (including Cursor) to follow consistently.

---

## 1) Goals

Nimara is an open-source, composable commerce ecosystem for building **storefronts** and **marketplaces**.

Primary goals:

- **Composable by default**: features and integrations are interchangeable modules.
- **No circular dependencies**: packages must never depend on apps.
- **Thin apps, thick packages**: apps are orchestrators; packages contain reusable logic.
- **Provider-driven architecture**: features depend on **contracts**, not implementations.
- **Framework-aware boundaries**: Next.js-specific concerns live in the app layer.
- **Override-first DX**: users can override only what they need without forking.

---

## 2) Repository Layout

Recommended monorepo structure:

```
apps/
  storefront/                 # Next.js app (thin orchestrator)
  vendor-panel/               # optional future app
  admin-panel/                # optional future app

packages/
  domain/                     # pure domain models/types (no framework deps)
  types/                      # contracts / ports (interfaces)
  core/                       # dependency injection context/provider
  core-routing/               # routing injection API (Link, href builders)
  core-actions/               # action injection (optional, for client usage)
  ui/                         # shadcn/ui + commerce UI components
  theme/                      # tokens + Tailwind preset
  features/                   # feature packages (PDP/PLP/Cart/Checkout/etc.)
  application/                # use-cases, orchestration of domain via ports
  integrations/               # adapters/implementations (Saleor/Stripe/Algolia/etc.)
  config/                     # shared config defaults, env schemas

infra/
  terraform/                  # optional deployment IaC modules

docs/
examples/
```

> **Rule of thumb**: if it can be reused across apps, it belongs in `packages/`.

---

## 3) Layering Model (Ports & Adapters)

Nimara follows a “clean architecture” / “ports and adapters” approach.

### Layers (from most stable to most volatile)

1. **Domain (`packages/domain`)**
   - Entities, value objects, domain utilities
   - No framework imports, no network calls

2. **Contracts / Ports (`packages/types`)**
   - Interfaces defining capabilities needed by the application/features
   - Example: `CommercePort`, `SearchPort`, `PaymentsPort`, `CmsPort`, `InventoryPort`, `AnalyticsPort`

3. **Application (`packages/application`)**
   - Use-cases that orchestrate domain logic via ports
   - No provider-specific code
   - No Next.js APIs (`cookies`, `headers`, `revalidate*`) here

4. **Features (`packages/features`)**
   - UI and feature logic for PDP/PLP/Cart/etc.
   - Consume **providers** / ports and application use-cases
   - Must not import from `apps/**`
   - Must avoid framework-only APIs (see Actions section)

5. **Integrations (`packages/integrations`)**
   - Adapter implementations for ports
   - Provider-specific code (Saleor, Stripe, Algolia, etc.)
   - Network clients, mapping, serialization
   - No app imports

6. **Apps (`apps/*`)**
   - Thin orchestration
   - Own framework configuration (Next.js, next-intl request/routing, middleware)
   - Wire providers and adapters into DI containers
   - Contain server-action wrappers, routes, deploy config

---

## 4) Dependency Rules (Hard Constraints)

### The Golden Rule
✅ `apps/**` can import from `packages/**`  
❌ `packages/**` must never import from `apps/**`

### Banned imports inside `packages/**`
- Any `@/…` alias resolving to app sources
- Any `apps/...`
- `next/headers`, `next/cache`, `next/navigation` (except in app wrappers)
- `process.env` direct reads (prefer injected config)

### Allowed imports inside `packages/**`
- Other packages (`@nimara/*`)
- Framework-agnostic libraries (`react`, utility libs)
- `next-intl` runtime hooks are allowed in UI/feature components, but:
  - next-intl **config files** remain in the app layer.

### Enforcing boundaries
Use ESLint boundary rules (recommended):
- `no-restricted-imports` patterns that forbid `apps/*` and `@/…` inside `packages/*`
- Optional: `eslint-plugin-boundaries` with layers

---

## 5) Provider / DI System

Nimara uses DI so features depend on contracts, not implementations.

### Core Provider
`@nimara/core` exposes:

- `NimaraProvider` (React context provider)
- `useNimara()` hook

The provider value contains concrete implementations for ports, e.g.:

- `commerce: CommercePort`
- `search: SearchPort`
- `payments: PaymentsPort`
- `cms: CmsPort`
- `inventory?: InventoryPort`
- `analytics?: AnalyticsPort`
- `config?: NimaraConfig`

### Wiring (in app layer)
Apps are responsible for instantiating adapter implementations and injecting them:

- `packages/integrations/*` provide `SaleorCommerce`, `StripePayments`, etc.
- `apps/storefront` picks which providers to wire (based on recipe/env)

---

## 6) Routing & i18n (next-intl)

### Problem
Feature packages often need locale-aware links (e.g., `LocalizedLink`) but must not import app code.

### Solution: Routing Injection
`@nimara/core-routing` defines a routing interface and exports:
- `RoutingProvider`
- `Link` component
- `useRouting()` hook
- optional `href()` builder

Apps inject their `LocalizedLink` implementation.
Features use `@nimara/core-routing` only.

### next-intl configuration
Framework-required files (e.g., `routing.ts`, `request.ts`, middleware) must live in the **app layer**.

Packages may contain:
- feature-local message bundles
- helper functions
- typed translation keys (optional)
Apps merge message bundles at runtime.

---

## 7) Actions Architecture (Server Actions)

### Why this matters
Next.js server actions require `"use server"` and often use:
- `cookies()` / `headers()`
- `revalidateTag()` / `revalidatePath()`
These are **framework-specific** and must not leak into packages.

### Pattern
1. **Package exports action factories** (`*.core.ts`)
   - Pure async functions
   - Depend on ports/providers
   - No `"use server"`
   - No Next.js APIs

2. **App exports server action wrappers**
   - `"use server"`
   - Inject providers and request context
   - Handle cookies/headers/cache revalidation
   - Return stable DTO results

> This keeps features reusable and testable, while apps remain framework-aware.

---

## 8) UI System (shadcn + Tokens)

### Single source of UI
All shadcn components must live in `@nimara/ui` and be imported from there.
Apps and features should not maintain separate shadcn copies.

### Theme
`@nimara/theme` provides:
- `tokens.css` (CSS variables)
- Tailwind preset/config utilities

Apps:
- import tokens in global styles
- provide branding overrides by overriding CSS variables

Next.js configuration should include `transpilePackages` and Tailwind content scanning for packages.

---

## 9) Feature Packages

Feature packages (e.g. PDP/PLP/Cart) should be structured consistently:

- `shared/providers/*` — data providers that accept injected services
- `shared/actions/*.core.ts` — pure action factories
- `shared/ui/*` — reusable UI subcomponents
- `messages/{locale}.json` — optional feature-local i18n bundles
- `index.ts` — stable public exports

### Features must not
- import app services directly
- read process env directly
- depend on filesystem paths from apps

---

## 10) Overrides Model

Nimara supports “override without forking”.

### Principle
- Packages provide baseline implementation
- App may override selective files under a dedicated override directory

Recommended location:
- `apps/storefront/src/nimara/**`

CLI future:
- `nimara override feature <name>`
- copies files from packages into override structure
- preserves folder structure to keep upgrades manageable

---

## 11) Recipes & Manifests (Foundation for CLI and Builder)

### Recipes
A YAML recipe describes the selected composition:
- apps (storefront, vendor panel, etc.)
- pages/features selection
- providers/infrastructure selection
- Saleor apps selection
- deployment targets (Vercel projects, etc.)

### Manifests
Each integration/provider should have a manifest that declares:
- id, category (payments/search/cms/commerce)
- required env vars
- packages to install
- configuration defaults
- docs steps
- optional smoke tests

Manifests are the source of truth for:
- `nimara add …`
- project validation
- future “v0-like builder” UI

---

## 12) Testing Strategy

### Packages
- Unit tests for `*.core.ts` actions with mocked ports
- Unit tests for providers/use-cases with fake adapters
- Optional: component tests for UI primitives

### Apps
- Smoke tests that confirm:
  - provider wiring works
  - `/api/health` responds
  - critical pages render (PDP/PLP/Cart)
- Optional: e2e tests (Playwright) for checkout flows

---

## 13) Versioning & Public API

### Public exports
Each package must define a stable public API via `src/index.ts`.
Internal modules should not be imported from outside the package.

### SemVer expectations
- Major: breaking API changes
- Minor: new features/export additions
- Patch: fixes only

---

## 14) “Cursor Rules” (Contributor Guidance)

When adding or modifying code, always check:

1. **Does this belong in a package or app?**
   - If reusable: package
   - If Next.js glue/config: app

2. **Are there forbidden imports in packages?**
   - No `@/…`, no `apps/**`, no Next.js server APIs

3. **Is this provider-specific?**
   - Put in `packages/integrations/*` and implement a port

4. **Is this an action requiring server concerns?**
   - Logic in `*.core.ts` (package)
   - Wrapper in app with `"use server"`

5. **Does UI import from `@nimara/ui`?**
   - Never from app-local shadcn

6. **If it needs routing or translations**
   - Use routing injection and feature-local messages
   - Keep next-intl config in the app layer

---

## 15) Definition of Done (Architecture)

A change is “architecture-compliant” if:

- No package imports app code
- Feature logic is reusable and DI-driven
- Server actions follow factory + wrapper pattern
- Routing is injected (no app-local link imports in packages)
- UI comes from `@nimara/ui`
- Integration code stays in adapters
- Recipes/manifests can describe how it’s composed

---

## Appendix: Quick Checklist for New Modules

### New integration/provider
- [ ] Add port/interface in `@nimara/types`
- [ ] Implement adapter in `packages/integrations/<provider>`
- [ ] Add manifest describing env/config/docs
- [ ] Wire provider in app registry/provider composition

### New feature
- [ ] Implement UI/logic in `packages/features/<feature>`
- [ ] Use DI providers/ports only
- [ ] Add `.core.ts` action factories if needed
- [ ] Add feature-local translations if applicable
- [ ] Export stable API in `index.ts`
- [ ] Add example route wrapper in `apps/storefront`

