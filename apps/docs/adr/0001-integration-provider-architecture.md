# ADR 0001 — Swappable integration providers

- **Status:** Accepted
- **Date:** 2026-06-03
- **Scope:** `apps/storefront/src/services`, `packages/infrastructure/src/{search,cms-page,cms-menu,payment,…}`

> This ADR lives outside the versioned Docusaurus content on purpose — it documents an
> internal architecture decision, not end-user docs.

## Context

Nimara's North Star promises "composable commerce, own your stack, no vendor lock-in".
Search and CMS already support multiple interchangeable providers (Saleor, Algolia,
ButterCMS, built-in dummy) selected at build time. We want to (1) make the pattern
credibly broad — swappable wherever more than one provider is real, (2) keep selection
build-time, (3) stop hand-maintaining the `ServiceRegistry`, and (4) end the scattering of
a provider's definition across many files.

## Decision

### 1. Swappable only where >1 provider is real

The provider pattern applies where multiple implementations genuinely exist:

- **Swappable:** `search`, `cms-page`, `cms-menu`, and **`payment`** (multi-PSP: Stripe
  today, Adyen/PayPal/… later).
- **Saleor-bound (NOT forced into the pattern):** `store`, `cart`, `checkout`, `user`,
  `address`, `collection`, `marketplace`. These are Saleor commerce primitives — "swapping"
  them means swapping the backend, a different axis. They remain single-provider loaders but
  are unified under the same capability registry.
- **Future capabilities** (email/notifications, analytics, reviews): added later as new
  capabilities, not by retrofitting existing ones.

### 2. Selection stays build-time

Providers are chosen via server-side env (`SEARCH_SERVICE`, `CMS_SERVICE`,
`PAYMENT_SERVICE`). No runtime/per-tenant config source. Per-provider credentials are
namespaced (`SEARCH_<PROVIDER>_*`, `CMS_<PROVIDER>_*`, `PAYMENT_<PROVIDER>_*`) and validated
lazily — only the selected provider's schema runs. For example, `CMS_SERVICE=butter-cms`
requires `CMS_BUTTER_TOKEN` (ButterCMS read token, used for both pages and menus).
`turbo.json` passes them via `SEARCH_*`, `CMS_*`, `PAYMENT_*` wildcards.

### 3. `ServiceRegistry` is derived, not hand-maintained

A single `CapabilityServices` type map in `packages/infrastructure/src/types.ts` maps each
getter to its service type; the `ServiceRegistry` type is derived from it
(`{ [K in keyof CapabilityServices]: () => Promise<CapabilityServices[K]> }`). The storefront
assembles the registry from a `LOADERS` table (`registry.ts`). Adding a capability is a
one-line change in each.

### 4. A provider is defined by one manifest

Each provider exports a co-located manifest — `{ id, configSchema, create }` — where
`create(env, logger)` lazily `import()`s the heavy factory (preserving per-provider
code-splitting) and validates its own namespaced env. The per-capability `select.ts` builds
its selector from an array of manifests, and the provider-id catalog (used by the env enum)
is **derived** from those manifests. Adding a provider = one manifest + one array entry; the
catalog, selector, and env docs follow. The previous standalone `providers-catalog.ts` is
removed.

## Consequences

- **Adding a provider** touches only `packages/infrastructure/<capability>/<provider>/` plus
  one manifest-array entry. The storefront needs **zero** changes (selection is env-driven;
  resolver/loader are generic).
- **Adding a capability** is a one-line addition to `CapabilityServices` + `LOADERS`.
- Integration config leaves the central `src/envs` schema and is co-located + validated
  per provider; core app config stays central. Integration config is server-side; a
  client-exposed provider would be an explicit, documented exception.
- Layer rules hold: `infrastructure` validates the `env` the app forwards (never reads
  `process.env`); `Result<T, E>` for fallible operations.
- Trade-off: deriving the registry type loses per-getter JSDoc; the manifest's catalog
  derivation replaces the compile-time "id without a factory" guard with "id and impl are the
  same object" (no separate list to drift).

## Non-goals

- Runtime / per-tenant provider switching (build-time only).
- Forcing the pattern onto Saleor-bound commerce primitives.
- New capabilities (email, analytics, …) — separate backlog.

## Maintenance

The `integrations-maintainer` subagent (`.claude/agents/integrations-maintainer.md`) owns
upkeep: adding/reviewing providers, keeping the manifest/catalog/selector/env conventions,
and running the quality gates.
