---
type: "Integration Note"
title: "CMS And Search"
description: "Provider families for storefront content, navigation, and search: Saleor, ButterCMS, Algolia, and zero-config dummy fixtures."
tags:
  - "integration"
  - "cms"
  - "search"
created: "2026-07-15T09:50:07+00:00"
timestamp: "2026-07-15T11:10:59+02:00"
knowledge_status: "current"
implementation_status: "conditional"
direction_status: "active"
verified_at: "2026-07-15T09:50:07+00:00"
code_branch: "main"
code_commit: "e32732ea85f7e6cfb807b462c7bbc47e6f569603"
scope_paths:
  - "packages/infrastructure/src/cms-page"
  - "packages/infrastructure/src/cms-menu"
  - "packages/infrastructure/src/search"
  - "packages/infrastructure/src/providers/cms.ts"
  - "apps/storefront/src/services/integrations"
---

# Content

CMS page and menu capabilities share one provider choice: Saleor, ButterCMS, or dummy fixtures.
Search independently supports Saleor, Algolia, or dummy fixtures. The storefront resolves and
loads providers lazily, validates provider configuration, and uses dummy/empty fallbacks when
Saleor is absent.

Provider environment configuration is not fully aligned across code, examples, and deployment
workflow. Algolia index configuration is validated but parts of runtime mapping remain hardcoded.
Core CMS, Saleor search, ButterCMS, and lazy-provider work is `Gotowe`. TypeScript custom search
is active, its Python successor is planned, and broader provider swapping remains planned. No
standalone custom-search application is present in this repository snapshot.

## Evidence

Infrastructure CMS/search provider catalogs and storefront integration resolution code at the
recorded commit.

# Related Notes

[Content Search And Localization](../../system/capabilities/Content%20Search%20And%20Localization.md)
[Service And Provider Architecture](../architecture/Service%20And%20Provider%20Architecture.md)
[Catalog And Discovery](../../system/capabilities/Catalog%20And%20Discovery.md)
