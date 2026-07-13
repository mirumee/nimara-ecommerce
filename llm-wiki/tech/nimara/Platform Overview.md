---
type: "Technical Reference"
title: "Platform Overview"
description: "What Nimara is for, its layered monorepo, the swap-anything integration model, and the zero-config boot — synthesized from the Nimara platform docs."
tags:
  - "nimara"
  - "platform"
  - "architecture"
  - "monorepo"
  - "reference"
resource: "/sources/nimara-docs/onboarding.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/onboarding.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Nimara is a modern **headless, composable commerce platform** built on top of [Saleor](/tech/saleor/Saleor%20API%20Overview.md), for teams who want SaaS-level speed without SaaS-level lock-in (source: [intro](/sources/nimara-docs/intro.md), [onboarding](/sources/nimara-docs/onboarding.mdx)). Its stated goals:

- Get a real storefront running in minutes — even before a backend is configured.
- Own every line of code: no closed cores, no required upgrades.
- Swap any integration — commerce backend, CMS, search, payments — without rewriting the app.
- Grow from one storefront into a multi-app monorepo (vendor panel, admin, internal tools) on one foundation.

### Layered monorepo
Nimara is a **layered monorepo**: each layer has one job and depends only on layers below it; nothing reaches up.

- **`domain`** — business types, rules, and error shapes. Knows nothing about React, GraphQL, or any backend.
- **`infrastructure`** — the only place that talks to the outside world (Saleor, ButterCMS, Algolia, Stripe). Every external service hides behind a domain-typed contract.
- **`foundation`, `ui`, `i18n`** — shared building blocks: hooks, design system, translations.
- **`features`** — full vertical slices (checkout, search, account) ready to drop into an app.
- **`apps/`** — what users see: the storefront, marketplace, and payment apps.

The full folder tour and deeper conventions live in the repo's `AGENTS.md`.

### The swap-anything promise
Saleor is the default commerce backend, but **nothing in the storefront or features layer knows that.** Every external system sits behind a domain-typed contract in `infrastructure`. The repo proves it: CMS pages have both a Saleor and a ButterCMS provider; search has both Saleor and Algolia. The cleanest reference example is the `cms-page` capability in `packages/infrastructure/src/cms-page/` — two providers, one shared port.

What this buys:

- **Change a CMS, not your codebase** — a new provider is one adapter for one capability; UI/feature code doesn't move.
- **Run before you commit** — no env vars → every service returns empty data, the UI still renders, nothing crashes.
- **Errors look the same everywhere** — every operation returns a `Result<T, E>` (`@nimara/domain/objects/Result`); no special "Saleor error" vs "Stripe error" path.
- **Pay for what you use** — backend SDKs (`buttercms`, `algoliasearch`, …) are optional peers, absent from the bundle when unused.

### Zero-config, feature-by-feature boot
The storefront boots **empty by default** and lights up as environment variables are added. One switch (`NEXT_PUBLIC_SALEOR_API_URL`) turns on most of the commerce surface; payment and marketplace are independent switches. Run `pnpm preflight` to see what's currently on. See [Environment Variables](/tech/nimara/Environment%20Variables.md) for the full switch table.

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Local Development & Workflow](/tech/nimara/Local%20Development%20%26%20Workflow.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Saleor API Overview](/tech/saleor/Saleor%20API%20Overview.md)
