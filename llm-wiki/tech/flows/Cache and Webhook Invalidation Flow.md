---
type: "Technical Flow"
title: "Cache and Webhook Invalidation Flow"
description: "How storefront reads receive resource tags and signed Saleor events invalidate affected cache entries."
tags:
  - "architecture"
  - "storefront"
  - "cache"
  - "webhooks"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "verified"
owner: "storefront"
verified_at: "2026-07-10T00:00:00+02:00"
source_refs:
  - "repo:apps/storefront/src/foundation/cache/cache.ts"
  - "repo:apps/storefront/src/foundation/webhooks.ts"
  - "repo:apps/storefront/src/app/api/webhooks/saleor/helpers.ts"
  - "repo:apps/storefront/src/app/api/webhooks/saleor/products/route.ts"
  - "repo:packages/features/src/product-detail-page/shared/providers/product-provider.tsx"
  - "repo:packages/features/src/cms-page/shared/providers/cms-page-provider.tsx"
---

# Content

## Tagged reads

Feature providers attach semantic tags to cached infrastructure reads. Product and collection
detail reads use both a resource tag such as `PRODUCT:<slug>` or `COLLECTION:<slug>` and a
surface tag such as `DETAIL-PAGE:PRODUCT`. CMS reads use `CMS:<slug>`. Revalidation time comes
from the configured service cache TTL.

Inventory-sensitive product availability is deliberately fetched without persistent caching,
so the product page can combine relatively stable content with current availability.

## Invalidation sequence

1. Saleor sends a webhook for a product, variant, media, collection, menu, page, or page type.
2. The storefront verifies the `saleor-signature` JWS against Saleor's remote JWKS before
   parsing the event.
3. The route extracts the affected slug. Events that only carry an ID, such as product-media
   events, perform a secure Saleor query to resolve the product slug.
4. The shared webhook handler builds the same semantic tag used by the read path.
5. The local cache wrapper calls Next.js `revalidateTag(tag, "max")` and records a debug event.

## Invariants

- Unverified webhook payloads must not trigger cache invalidation.
- Read and invalidation paths must use exactly the same tag vocabulary.
- A webhook without a resolvable slug returns successfully without broad cache eviction.
- Failures resolving an indirect product slug are logged and do not fabricate a tag.
- Webhook invalidation targets affected resources rather than clearing the entire storefront
  cache.

## Verification

- Compare tags in product, collection, CMS, header, and footer reads with route prefixes.
- Exercise an invalid signature and confirm no call to `revalidateTag` occurs.
- Exercise direct and indirect product events and verify the emitted `PRODUCT:<slug>` tag.
- Verify menu/page events emit `CMS:<slug>` and collection events emit
  `COLLECTION:<slug>`.

# Related Notes

[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[Storefront Data Flow](tech/flows/Storefront%20Data%20Flow.md)
[Checkout and Payment Flow](tech/flows/Checkout%20and%20Payment%20Flow.md)
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
