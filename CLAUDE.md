# Nimara E‑commerce

## Abstract

Nimara is a monorepo for composable commerce. It is an open-source, composable commerce ecosystem for engineering teams who want:

- **SaaS-level speed to start**
- **Full ownership and control**
- **Modular architecture**
- **Clean monorepo structure**
- **Agentic development ready**

---

## Global rules

- `main` is the only long-lived branch and is always releasable. Start focused change branches from the latest `main`, target squash-merged pull requests back to `main`, and aim to merge within two working days.
- Durable project knowledge lives in `llm-wiki/`. Read it before deriving from the code what is already written down, and finish any change to it with `pnpm wiki:lint` at zero violations.
- Check llm-wiki skills if you are planning new features/requirements. - llm-wiki/.claude/skills
- Use a Conventional Commit pull-request title because the squash title drives semantic-release.
  Required checks are `Linters & Tests`, `Vercel – nimara-docs`,
  `Vercel – nimara-ecommerce`, `Vercel – nimara-ecommerce-stripe`, and
  `Vercel – nimara-marketplace`.
- Do not write comments in code. This applies to new code and to code that you edit.
- Split longer work into releasable slices. Keep incomplete behavior behind a short-lived,
  default-off feature flag or branch-by-abstraction seam, test meaningful states, and remove the flag after rollout.
- Never add or remove a dependency without explicit user approval.
- Never read, expose, or commit local secrets.
- Never hand-edit generated GraphQL files. Run `pnpm codegen` after `.graphql` changes.

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
└── automated-tests/         # CodeceptJS E2E tests

packages/
├── domain/                  # Pure business logic (types, consts, entities)
├── foundation/              # Utilities, hooks, helpers
├── infrastructure/          # External API integrations (Saleor, ButterCMS, etc.)
├── features/                # Feature implementations (UI + logic + state)
├── ui/                      # Shared UI components (Shadcn-style)
└── config/                  # Shared configs (Tailwind, ESLint, PostCSS)

llm-wiki/                    # Versioned knowledge base; not code, not built, not shipped
```

### Dependency Flow

The project follows the principles of Clean Architecture and Hexagonal architecture

---

## Knowledge Base

`llm-wiki/` is a Git-versioned knowledge base: what the product currently does, why it was decided,
what was implemented and how it was verified, how it is operated, and what QA knows. It describes
the tree at the commit that contains it, so a record is as reviewable as the code beside it.

- **Read it first.** Before reconstructing behavior from code, check whether a capability, flow,
  integration contract, or runbook already states it. `llm-wiki/README.md` holds the schema and
  `llm-wiki/index.md` lists every record.
- **Keep it true with the code.** Current-state records — CAP, FLOW, INT, OPS — are updated in the
  same change as the behavior they describe, and an implementation record captures what shipped.
- **Close every change with `pnpm wiki:lint`,** at zero violations. It is not wired into CI, so
  nothing else will run it. `pnpm wiki:index:sync` maintains the registers.
- Skills for working on it live in `llm-wiki/.claude/skills/` and load once a file there is read.
