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
