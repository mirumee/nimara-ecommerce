---
type: "Capability"
title: "Content Search And Localization"
description: "Composable CMS, menu, search, locale, region, channel, currency, and translated storefront behavior."
tags:
  - "capability"
  - "cms"
  - "search"
  - "i18n"
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
  - "packages/i18n"
  - "apps/storefront/src/services"
---

# Content

## Current implementation

CMS pages and menus share a provider choice of Saleor, ButterCMS, or dummy fixtures. Search can
use Saleor, Algolia, or dummy fixtures. `SEARCH_SERVICE` and `CMS_SERVICE` are server-side,
build-time choices. Missing Saleor configuration falls back to dummy services outside production
and empty services in production.

The i18n package provides locale-aware routing/messages and US/UK regional configuration. Saleor
webhooks revalidate products, collections, pages, and menu caches.

## Direction and gaps

Provider contracts are implemented for CMS/search, and core CMS/i18n behavior is established,
but the same pattern is not universal across all capabilities. TypeScript custom search remains
active, and country/language/currency/channel behavior still needs refinement. Builder.io and
selected Algolia extensions are not current product directions; that does not remove the existing
ButterCMS or Algolia providers. Environment names and workflows still show drift.

## Evidence

Primary paths: infrastructure CMS/search providers, `packages/i18n`, storefront service loaders,
environment schemas, and Saleor webhook routes.

# Related Notes

[CMS And Search](../../tech/integrations/CMS%20And%20Search.md)
[Service And Provider Architecture](../../tech/architecture/Service%20And%20Provider%20Architecture.md)
[Catalog And Discovery](./Catalog%20And%20Discovery.md)
