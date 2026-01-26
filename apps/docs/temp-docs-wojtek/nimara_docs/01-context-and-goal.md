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
