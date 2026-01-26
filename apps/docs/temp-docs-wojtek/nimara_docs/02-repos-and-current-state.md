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
