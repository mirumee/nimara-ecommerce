# Nimara E‑commerce

## Abstract

Nimara is a Node.js monorepo for composable commerce. It is an open-source, composable commerce ecosystem for engineering teams who want:

- **SaaS-level speed to start** - Get up and running quickly
- **Full ownership and control** - Own your code, no vendor lock-in
- **Modular architecture** - Replaceable integrations and features
- **Clean monorepo structure** - Enable multiple frontends and backend components

---

## Global rules

- `main` is the only long-lived branch and is always releasable. Start focused change branches
  from the latest `main`, target squash-merged pull requests back to `main`, and aim to merge
  within two working days.
- Use a Conventional Commit pull-request title because the squash title drives semantic-release.
  Required checks are `Linters & Tests`, `Vercel – nimara-docs`,
  `Vercel – nimara-ecommerce`, `Vercel – nimara-ecommerce-stripe`, and
  `Vercel – nimara-marketplace`.
- Split longer work into releasable slices. Keep incomplete behavior behind a short-lived,
  default-off feature flag or branch-by-abstraction seam, test meaningful states, and remove the
  flag after rollout.
- Vercel deploys accepted `main` changes to production. For a regression, restore the previous
  Vercel deployment and submit a revert or fix-forward pull request; never rewrite `main` or
  published tags.
- Never add or remove a dependency without explicit user approval.
- Never read, expose, or commit local secrets.
- Never hand-edit generated GraphQL files. Run `pnpm codegen` after `.graphql` changes.

---

## The North Star

A developer should be able to:

1. **Create a new project quickly** - Minimal setup, maximum productivity
2. **Add storefront and integrations incrementally** - Start simple, grow as needed
3. **Run locally with minimal config** - Dummy profiles work out of the box
4. **Override only what they need** - No forking required
5. **Deploy with predictable infra scripts** - Terraform modules included
6. **Expand into multi-app monorepo** - Vendor panel, admin panel, services, integrations

---

## Architecture Overview

Nimara uses a **layered monorepo** with strict dependency boundaries to keep code maintainable and reusable.

**For detailed guidance on package layers, dependency direction, and architectural decisions, see the `/project-guidelines` skill.**

### Layers

```
apps/
├── storefront/              # Next.js customer storefront
├── marketplace/             # Vendor dashboard; Postgres ledger, Stripe Connect, payout batches
├── stripe/                  # Stripe payment integration app (Saleor Payment Gateway)
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

The project follows the principles of Clean Architecture
