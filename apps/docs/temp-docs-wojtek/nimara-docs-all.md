# Nimara Documentation Pages (Generated)


---

<!-- 01-context-and-goal.md -->

# Nimara: Context and Goal

Nimara is an open-source, composable commerce ecosystem for building **storefronts** and **marketplaces**. It is designed for enterprise and startup engineering teams who want:

- SaaS-level speed to start
- Full ownership and control of code
- Modular architecture with replaceable integrations
- A clean monorepo structure enabling multiple frontends and backend components

## What we are building

Nimara provides:

- A **Next.js storefront** app (thin orchestrator)
- A set of **feature packages** (PDP, PLP, Cart, Checkout, Account, Search, CMS pages)
- A set of **integration/provider packages** (Saleor, Stripe, Algolia/Meilisearch, CMS, analytics, etc.)
- A **design system package** (shadcn/ui extended + theme tokens)
- A **dependency injection system** (providers) that makes packages independent from the app
- Tooling for:
  - recipes/manifests
  - CLI commands (`nimara init`, `nimara add`, `nimara override`)
  - a future **v0-like builder** UI that generates a project from selected blocks/providers

## The North Star

A developer should be able to:

1. Create a new project quickly
2. Add storefront and integrations incrementally
3. Run locally with minimal config (dummy profile)
4. Override only what they need
5. Deploy with predictable infra scripts
6. Expand into multi-app monorepo (vendor panel, admin panel, services)


---

<!-- 02-repos-and-current-state.md -->

# Repositories and Current State

This project includes multiple repos (some already merged conceptually into a monorepo plan):

## Primary repos

### `nimara-ecommerce`
The main monorepo evolving into the platform base:
- `apps/storefront` (Next.js app)
- `packages/*` (features, UI, infrastructure, foundation, domain, etc.)

### `nimara-platform-init`
Starter project template for a platform monorepo.

### `nimara-recipes`
Prototype CLI instructions for integrating Saleor storefront + apps.

## Saleor apps / services repos (installable)
- `nimara-stripe` (Saleor app)
- `nimara-mailer` (Saleor app)
- search-related app/tooling (e.g. Algolia integration)

## Target outcome
A clean, OSS-ready monorepo where:
- Storefront is a thin orchestrator
- All reusable logic lives in packages
- Saleor apps are installable via selected services in recipes/manifests


---

<!-- 03-developer-journey.md -->

# Developer Journey (DX)

Nimara’s documentation and tooling should mirror the ideal developer journey.

## The workflow (target)

### Create project
```bash
npx create-nimara-app my-project
cd my-project
```

### Add pieces incrementally (no "wizard")
```bash
nimara add storefront
nimara add provider saleor
nimara add provider payments-dummy
nimara add provider search-algolia
nimara add saleor-app stripe
```

### Run locally
```bash
pnpm dev
```

### Override when needed
```bash
nimara override feature product-detail-page
nimara override ui button
nimara override action add-to-bag
```

### Deploy
- Vercel projects for frontend apps
- Terraform modules for infra (optional)
- CI smoke tests validate providers/health

## DX principles

- Start minimal, add complexity only when selected
- Maintain clean boundaries: packages never import app code
- Make overrides safe, explicit, and reversible
- Provide profiles for local dev that work without real integrations


---

<!-- 04-configuration-and-recipes.md -->

# Configuration Model: Recipes

Nimara uses YAML recipes to describe the selected composition of apps, features, infra, and Saleor apps.

## Why recipes?
- Deterministic project composition
- CLI and builder can generate the project from the same source of truth
- Enables swapping providers without rewriting features

## Example: platform recipe (monorepo)
```yaml
meta:
  name: "My Platform"
  environments: ["dev", "prod"]

apps:
  - name: storefront
    path: "frontend/storefront"
    recipe:
      meta:
        name: "My Store"
        type: storefront
      pages:
        - home: e-commerce-basic-home
        - plp: e-commerce-basic-plp
        - pdp: e-commerce-basic-pdp
        - cart: e-commerce-basic-cart
      infra:
        - search: { provider: "search-saleor" }
        - payments: { provider: "payments-dummy" }
        - content: { provider: "content-saleor" }
      saleor:
        apps: []
    generate: true

services: []

saleor:
  defaults:
    url: "${SALEOR_API}"
    channel: "default-channel"
  apps: []

infra:
  modules: []
  vercel:
    projects:
      - name: "${VERCEL_PROJECT_STORE}"
        path: "frontend/storefront"
```

## App recipe vs platform recipe

- `monorepo.recipe.yaml`: describes multiple apps + shared infra.
- `storefront.recipe.yaml`: describes the storefront composition only.

## Validation
Add `nimara validate` that checks:
- required env vars for selected providers/apps
- provider compatibility
- missing page blocks


---

<!-- 05-monorepo-structure.md -->

# Monorepo Structure (Medusa-style cleanliness)

Nimara aims for a clean separation of:
- apps (thin orchestration)
- packages (reusable logic)
- integrations (adapters/providers)
- domain (pure types/models)

## Proposed structure

```
apps/
  storefront/          # Next.js app (thin orchestrator)
  vendor-panel/        # optional future
  admin-panel/         # optional future
packages/
  domain/              # pure domain models/types
  types/               # contracts/ports
  core/                # DI contexts/providers
  core-routing/        # routing injection
  core-actions/        # action injection (optional)
  ui/                  # shadcn + tokens-consumer
  theme/               # tokens + tailwind preset
  features/            # PDP/PLP/Cart/etc.
  application/         # use-cases depending on ports
  integrations/        # saleor/stripe/algolia adapters
  config/              # shared defaults/env schema
infra/
  terraform/           # optional
docs/
examples/
```

## Rules
- `packages/**` NEVER import from `apps/**`
- apps can import any packages
- integrations implement ports from `types`
- features depend on core/types/ui/foundation, not app


---

<!-- 06-externalizing-generated.md -->

# Externalizing `_generated` into Packages

## Problem
The storefront contained a `src/_generated` directory with reusable UI/features.
We want to move it to `packages/*` to:
- reduce app complexity
- enable reuse across apps
- support CLI-driven composition

## The extraction pattern

1. Move reusable modules to `packages/features` (or appropriate package)
2. Replace app-specific imports with injected abstractions:
   - routing via `@nimara/core-routing`
   - services via providers / ServiceRegistry
   - UI via `@nimara/ui`
3. Keep only glue in the app:
   - route re-exports (`app/_generated/...page.tsx`)
   - provider wiring
   - Next.js server action wrappers

## Rule
Packages must not import:
- `@/…`
- `apps/...`
- Next.js framework internals like `next/headers` (except in app wrappers)

## Overrides
Place app overrides in `apps/storefront/src/nimara/**`.
The CLI can copy files from packages into the override path without changing structure.


---

<!-- 07-dependency-injection-and-providers.md -->

# Dependency Injection (IoC) and Providers

The central rule: **feature packages must not depend on the app**.

To achieve that, Nimara uses DI (inversion of control):
- packages depend on interfaces
- apps provide concrete implementations

## Core provider
`@nimara/core` exposes a `NimaraProvider` and `useNimara()` hook.

Providers typically include:
- commerce
- search
- CMS
- inventory
- analytics
- config

## Example
```tsx
"use client";
import { NimaraProvider } from "@nimara/core";
import { SaleorCommerce } from "@nimara/integrations-saleor";

export function AppProviders({ children }) {
  const providers = {
    commerce: new SaleorCommerce({ apiUrl: process.env.NEXT_PUBLIC_SALEOR_API! })
  };

  return <NimaraProvider value={providers}>{children}</NimaraProvider>;
}
```

## Benefits
- No circular dependencies
- Swap providers without changing features
- Features become testable (mock providers)
- Enables marketplace / multi-app setup


---

<!-- 08-routing-and-i18n-next-intl.md -->

# Routing & i18n (next-intl) in a Modular Monorepo

## Problem: LocalizedLink dependency
Features used app-local `LocalizedLink` heavily.
This blocked extraction to packages.

## Solution: routing injection
Introduce `@nimara/core-routing`:
- defines `LinkProps`, `Routing` interface
- provides `RoutingProvider` and `<Link />`

The app injects `LocalizedLink`:
```tsx
<RoutingProvider value={{ Link: LocalizedLink, href: buildHref }}>
  {children}
</RoutingProvider>
```

Packages use:
```tsx
import { Link } from "@nimara/core-routing";
```

## next-intl config location
next-intl requires `request.ts` and `routing.ts` by convention, but the app should keep them.
Packages must not own framework config.

Recommended:
- keep `apps/storefront/src/i18n/*` (framework-required)
- packages keep only translations & helper functions

## Translations strategy
- colocate translations per feature in packages
- app merges bundles at runtime
- optional type generation for keys


---

<!-- 09-ui-system-shadcn-theme.md -->

# UI System: shadcn + Theme Tokens

## Problem
Both app and packages relied on shadcn components installed locally in the app.
This creates duplication and coupling.

## Solution: central UI package
Create `@nimara/ui` containing all shadcn components:
- Button, Input, Dialog, etc.
- re-export via `@nimara/ui`

Apps and packages import from `@nimara/ui` only.

## Theme tokens
Create `@nimara/theme`:
- `tokens.css` defining CSS variables
- `tailwind-preset` exporting Tailwind config preset

Apps:
- import tokens in `globals.css`
- override variables in `:root` for branding
- ensure Tailwind scans package sources + node_modules

## Next.js requirements
- add `transpilePackages: ["@nimara/ui", "@nimara/theme", ...]`
- Tailwind `content` includes packages


---

<!-- 10-actions-architecture-server-actions.md -->

# Actions Architecture (Next.js Server Actions)

## Problem
Packages should be framework-agnostic, but Next.js server actions require `"use server"` and may use:
- cookies()
- headers()
- revalidateTag()

These belong to the app.

## Pattern
1) In packages: export action factories (pure)
- no `"use server"`
- depends on interfaces/providers

2) In app: wrap as server actions
- `"use server"`
- inject providers + per-request context
- run revalidation/cookies/etc.

## Example
Package:
```ts
export function createAddToBag({ cart }) {
  return async (input, ctx) => cart.addItem(...);
}
```

App wrapper:
```ts
"use server";
const impl = createAddToBag({ cart: providers.cart });
export async function addToBagAction(input) {
  const userId = cookies().get("uid")?.value;
  const res = await impl(input, { userId });
  revalidateTag(`cart:${userId}`);
  return res;
}
```

## Optional: ActionsProvider
If features should call actions via hooks, add `@nimara/core-actions`.


---

<!-- 11-integrations-model.md -->

# Integrations Model: Providers, Manifests, Saleor Apps

## Terminology
- **Providers**: replaceable integrations (payments/search/CMS/commerce)
- **Adapters**: implementation packages (SaleorCommerce, StripePayments, AlgoliaSearch)
- **Saleor Apps**: installable apps that connect to Saleor (nimara-mailer, nimara-stripe)

## Why “providers not apps”
Features should never import Stripe/Algolia directly.
They import interfaces and call injected providers.

## Manifests
Each integration should have a manifest describing:
- id
- type (payments/search/cms)
- required env vars
- packages to install
- docs steps
- optional Saleor app installation steps

Manifests power:
- `nimara add`
- validation
- the future builder

## Swapping
Swap providers without changing features.
Example: Algolia → Meilisearch by changing provider selection and env vars.


---

<!-- 12-overrides.md -->

# Overrides: Customizing Without Forking

## Goal
Let users override only what they need without forking the entire repo.

## Strategy
- package code is the default baseline
- app contains override folder (e.g. `apps/storefront/src/nimara/**`)
- CLI copies selected modules from packages into overrides

## Typical override targets
- UI components (from `@nimara/ui`)
- feature components (from `@nimara/features`)
- pages/layouts
- action wrappers
- providers/adapters

## Command examples
```bash
nimara override feature product-detail-page
nimara override component ProductGallery
nimara override action add-to-bag
```

## Rule
Overrides must preserve folder structure to keep future sync possible.


---

<!-- 13-roadmap-perfect-oss.md -->

# Roadmap to a “Perfect Open Source Repo”

## Milestone 1: Thin storefront
- finish extracting features from app into packages
- remove bad imports in packages
- normalize actions into `.core.ts` + app wrappers

## Milestone 2: Clean architecture layers
- introduce `application` layer with ports
- move provider-specific code to integrations/adapters
- enforce boundaries with ESLint

## Milestone 3: Profiles and dummy providers
- local dev profile works without real keys
- health endpoints + smoke tests

## Milestone 4: Manifests + recipes
- declarative integration manifests
- recipe validation

## Milestone 5: CLI v0 + examples
- `init`, `add`, `override`
- 1–2 example projects

## Milestone 6: v0-like builder MVP
- compose storefront/marketplace blocks
- pick providers
- generate repo + instructions

## Milestone 7: Docs + marketing alignment
- docs follow developer journey
- website pages match architecture narrative


---

<!-- 14-marketing-docs-alignment.md -->

# Marketing & Documentation Alignment

## Principle
Website copy and docs must reflect how the product actually works:
- packages, not templates
- providers, not hardcoded integrations
- thin storefront orchestrator
- feature packages
- action factories + app wrappers
- routing injection + modular i18n
- overrides model

## Website pages that must emphasize architecture
- Homepage: Commerce OS + diagram + CLI flow
- Storefront: thin orchestrator + features + providers + actions + routing/i18n
- Apps & Integrations: provider model + manifests + swapping
- Developer Experience: overrides, DI, actions, monorepo
- Enterprise: multi-brand, multi-store, replaceable integrations, governance

## Docs IA should mirror DX
- Getting Started
- Add Providers
- Add Features
- Override
- Deploy
- Architecture deep dives


