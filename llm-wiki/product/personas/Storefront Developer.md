---
type: "Persona"
title: "Storefront Developer"
description: "PRIMARY persona — a TypeScript/Next.js developer (in-house or agency) who adopts Nimara to ship a production Saleor storefront without building checkout, search, and integrations from scratch."
tags:
  - "persona"
  - "primary"
  - "developer"
  - "adoption"
created: "2026-06-11T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

### Goals
- Go from `git clone` to a deployed, working store (Vercel + Saleor + Stripe) in hours, not weeks.
- Customize and extend safely — swap providers (CMS, search, payments, commerce engine) behind stable interfaces, and pull upstream updates without merge hell.

### Pain Points
- Setup friction: broken deploy flows, undocumented environment variables, integrations that don't work on the first try, gaps in configuration docs.
- Integration plumbing eats their time — webhook registration, codegen failures, middleware and cookie handling, observability wiring.
- Hard to judge code quality before committing: inconsistent error handling, loose type definitions, and uneven repository conventions erode trust in the framework.

### Behavior Patterns
- **Frequency:** Daily during the build phase (typically 4–12 weeks), then episodic for upgrades and new features.
- **Technical level:** Advanced (TypeScript, React Server Components, GraphQL, AWS/Vercel).
- **Decision process:** Evaluates solo or in a small team — reads the README, tries the demo store, attempts a deploy within the first hour. Abandons silently if setup fails; GitHub issues are their support channel.
- **Current solution:** Saleor's own examples, a hand-rolled Next.js storefront, or a commercial alternative. Hand-rolling means rebuilding the long tail of checkout edge cases Nimara has already solved.

### Key Quote
> "I don't want a demo that works on your machine — I want my store on my Saleor instance deployed before lunch."

### Product Implications
- Prioritize the zero-to-deployed path above new features: working one-click deploy, complete environment variable docs, a clear onboarding guide. Every broken setup step is a lost adopter you never hear from.
- Keep the provider-swap architecture a first-class contract — it's the differentiator vs. hand-rolling.
- Invest in documentation infrastructure and repository hygiene — this persona judges the product by its repo.
- Don't hide configuration in UIs; they want env vars, code, and infrastructure-as-code they can read.

## Related Notes
[EPIC-001 Natural-Language Product Discovery](product/epics/EPIC-001%20Natural-Language%20Product%20Discovery.md)
[Ecommerce Manager](product/personas/Ecommerce%20Manager.md)
[Marketplace Vendor](product/personas/Marketplace%20Vendor.md)
[Anti-Persona - No-Code Solo Merchant](product/personas/Anti-Persona%20-%20No-Code%20Solo%20Merchant.md)
