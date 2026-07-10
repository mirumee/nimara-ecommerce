---
type: "Technical Flow"
title: "Storefront Data Flow"
description: "How a storefront request is composed through app routing, the service registry, features, use cases, and Saleor infrastructure."
tags:
  - "architecture"
  - "storefront"
  - "data-flow"
  - "saleor"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "storefront"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "repo:apps/storefront/src/app/[locale]/(main)/products/[slug]/page.tsx"
  - "repo:apps/storefront/src/services/registry.ts"
  - "repo:apps/storefront/src/services/lazy-loaders/store.ts"
  - "repo:packages/features/src/product-detail-page/shared/providers/product-provider.tsx"
  - "repo:packages/infrastructure/src/use-cases/store/get-product-details-use-case.ts"
  - "repo:packages/infrastructure/src/store/saleor/infrastructure/get-product-details-infra.ts"
---

# Content

## Sequence

1. A Next.js App Router page resolves route parameters and request context such as region and
   checkout identity.
2. Independent request data and the application service registry are loaded in parallel.
3. The app selects a feature view and passes services, paths, region, and app-specific actions
   across the composition boundary.
4. The feature provider requests a domain-facing service from the registry and supplies cache
   policy and tags for the current resource.
5. The infrastructure use case coordinates independent provider calls. Product detail and
   current availability are fetched in parallel; availability deliberately bypasses the
   long-lived product cache.
6. Saleor GraphQL infrastructure serializes provider responses into domain objects. Expected
   absence or unavailability is returned as a `Result` error, and the feature maps a missing
   product to `notFound()`.
7. The feature renders domain data. Marketplace-specific vendor enrichment is enabled by app
   configuration but remains implemented behind the store service.

## Layer ownership

| Layer                   | Responsibility in this flow                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| App                     | Route, locale/region, service registry, paths, environment-selected view |
| Feature                 | Data request shape, cache tags, presentation, loading boundaries         |
| Infrastructure use case | Coordination and business-facing result semantics                        |
| Provider infrastructure | GraphQL, authentication, serialization, external errors                  |
| Domain                  | Product, availability, region, and `Result` contracts                    |

## Invariants

- App and feature code consume domain-facing services rather than generated Saleor types.
- Independent fetches should not become sequential waterfalls.
- Product content may be cached, but inventory-sensitive availability is fetched with
  `no-store` semantics.
- Provider-specific vendor lookup remains inside infrastructure.
- Expected provider failures cross the service boundary as `Result`, not unstructured throws.

## Verification

- Trace the product page through `ProductProvider` to `getProductDetailsUseCase` and the Saleor
  infrastructure implementation.
- Confirm product reads carry `PRODUCT:<slug>` and `DETAIL-PAGE:PRODUCT` tags.
- Confirm the availability branch has an empty tag set and `no-store` cache behavior.

# Related Notes

[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Cache and Webhook Invalidation Flow](tech/flows/Cache%20and%20Webhook%20Invalidation%20Flow.md)
[Checkout and Payment Flow](tech/flows/Checkout%20and%20Payment%20Flow.md)
[Storefront Developer](product/personas/Storefront%20Developer.md)
