---
type: "Implementation Record"
title: "Marketplace Vendor Panel in Saleor Dashboard"
description: "Opens the marketplace vendor administration panel inside Saleor Dashboard."
tags:
  - "implementation"
  - "marketplace"
  - "saleor"
created: "2026-11-19T00:00:00+01:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "868"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/868"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Marketplace Vendor Operations](../../product/capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/868"
verification:
  - criterion: "Catalog → Marketplace uses an embedded app page at the vendor administration URL."
    tests:
      - "apps/marketplace/src/app/api/saleor/manifest/route.test.ts"
rollout: "Deploy the marketplace app and reinstall it in existing Saleor environments to register the new extension target. Open Catalog → Marketplace with a staff account that has MANAGE_USERS to verify the embedded panel."
rollback: "Revert the manifest change, deploy the marketplace app, and reinstall it to register the previous extension target."
---

# Implementation summary

The manifest registers **Catalog → Marketplace** as an `APP_PAGE` extension. The extension path
`/` resolves against the application URL, which points to the vendor administration panel at
`/app`. Saleor Dashboard opens the panel in an iframe.

# Verification evidence

All 27 marketplace unit tests passed. The manifest regression test checks the catalog mount,
the app URL, the embedded target, and the required staff permission. Verify the iframe in a
running Saleor Dashboard after deployment and app installation.
