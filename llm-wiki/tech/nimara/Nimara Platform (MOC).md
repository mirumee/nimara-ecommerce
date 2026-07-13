---
type: "Map of Content"
title: "Nimara Platform (MOC)"
description: "Map of Content for the Nimara platform docs — entry point to per-topic notes synthesized from the archived Nimara developer/operator documentation (version 2.0.x)."
tags:
  - "nimara"
  - "platform"
  - "docs"
  - "moc"
  - "index"
resource: "/sources/nimara-docs/intro.md"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/intro.md) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Reference map for the **Nimara platform documentation** — the developer/operator guide to running, configuring, extending, and deploying a Nimara storefront and its companion apps. These notes synthesize the archived `apps/docs` bundle (source: [Nimara docs](/sources/nimara-docs/intro.md)); the source files remain the source of truth. This bundle documents *Nimara the platform*; for the backend commerce contract Nimara consumes, see the [Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md).

Start with [Platform Overview](/tech/nimara/Platform%20Overview.md) for what Nimara is, its layered monorepo, and the swap-anything / zero-config promises.

### Getting started
- [Platform Overview](/tech/nimara/Platform%20Overview.md) — what Nimara is for, the layered monorepo, swap-anything integrations, zero-config boot.
- [Local Development & Workflow](/tech/nimara/Local%20Development%20%26%20Workflow.md) — prerequisites, fork/install/run, day-to-day commands, conventions.
- [Environment Variables](/tech/nimara/Environment%20Variables.md) — required and optional storefront variables and how features light up.

### Configuration & content
- [Saleor CMS](/tech/nimara/Saleor%20CMS.md) — homepage, navigation, footer, and static pages via Saleor content.
- [Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md) — the shared `@nimara/i18n` package and message composition.
- [Channels & Markets](/tech/nimara/Channels%20%26%20Markets.md) — adding a new locale, language, and market/channel.

### Apps & integrations
- [Storefront](/tech/nimara/Storefront.md) — storefront setup, Saleor webhooks, and Vercel deployment.
- [Marketplace](/tech/nimara/Marketplace.md) — the vendor portal app and vendor onboarding flow.
- [Stripe Integration](/tech/nimara/Stripe%20Integration.md) — the Python and TypeScript Stripe payment apps.
- [UCP Integration](/tech/nimara/UCP%20Integration.md) — the built-in Universal Commerce Protocol implementation for agentic commerce.

### Delivery
- [Release Workflow](/tech/nimara/Release%20Workflow.md) — the `develop` → `staging` → `main` branch/release flow.
- [Terraform Deployment](/tech/nimara/Terraform%20Deployment.md) — deploying the storefront to Vercel as infrastructure-as-code.

## Related Notes
[Platform Overview](/tech/nimara/Platform%20Overview.md)
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[ADR MOC](/tech/ADR/ADR%20MOC.md)
[Nimara Docs Source](/sources/nimara-docs/intro.md)
