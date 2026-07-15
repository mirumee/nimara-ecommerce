---
type: "Capability"
title: "Product Reviews"
description: "Current placeholder review presentation compared with the planned verified-purchase review system."
tags:
  - "capability"
  - "reviews"
  - "product-detail"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "mixed"
implementation_status: "partial"
direction_status: "planned"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "packages/features/src/product-detail-page/shared/components/product-reviews.tsx"
  - "packages/features/src/product-detail-page/shop-custom-pdp/custom.tsx"
---

# Content

## Current implementation

The custom product-detail-page variant renders a `ProductReviews` component. The component
waits two seconds and displays a hard-coded in-memory list of eight example reviews. Its source
comment explicitly identifies it as a placeholder for a future implementation.

No review provider, persistent review storage, verified-purchase submission, invitations,
rating aggregation, moderation, reporting, or review administration was observed on the
recorded `main` snapshot. The placeholder must not be presented as a working user-reviews
system.

## Direction and gaps

The Verified User Reviews PRD describes a substantially broader verified-purchase capability
and remains `analyzing`. The capability is planned, while code remains only a visible
placeholder. Neither the current implementation nor the PRD supports calling reviews wired.

## Evidence

- Presentation: `packages/features/src/product-detail-page/shared/components/product-reviews.tsx`.
- Wiring: `packages/features/src/product-detail-page/shop-custom-pdp/custom.tsx`.
- Directional document: [PRD User Reviews](../../product/prds/PRD%20User%20Reviews.md).

# Related Notes

[Catalog And Discovery](./Catalog%20And%20Discovery.md)
[Commerce Storefront](./Commerce%20Storefront.md)
[PRD User Reviews](../../product/prds/PRD%20User%20Reviews.md)
