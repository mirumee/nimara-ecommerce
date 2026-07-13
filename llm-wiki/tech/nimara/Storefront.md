---
type: "Technical Reference"
title: "Storefront"
description: "Setting up the Nimara storefront locally, configuring the four Saleor webhooks it needs, and deploying it to Vercel."
tags:
  - "nimara"
  - "storefront"
  - "webhooks"
  - "deployment"
  - "reference"
resource: "/sources/nimara-docs/storefront.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/storefront.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

The customer-facing Next.js app (source: [storefront](/sources/nimara-docs/storefront.mdx)). Live demo: [demo.nimara.store](https://www.demo.nimara.store).

### Local setup
1. Fork and clone the [Nimara repo](https://github.com/mirumee/nimara-ecommerce), then `pnpm install`.
2. `cp .env.example .env` and set the backend URL:
   ```properties
   NEXT_PUBLIC_SALEOR_API_URL=https://{your_domain}.saleor.cloud/graphql/
   # local: NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/
   ```
   For the full variable list see [Environment Variables](/tech/nimara/Environment%20Variables.md).
3. `pnpm run dev:storefront`.

The storefront passes `app: "storefront"` to `@nimara/i18n`'s `createRequestConfig`, receiving the `common` + `storefront` message bundles — see [Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md).

### Webhooks
Saleor webhooks push real-time events (product/page/menu/collection changes) to the storefront so it can invalidate caches and stay in sync. Configure them in the Saleor dashboard under **Extensions** (add an extension with **Provides details manually**, granting **Manage navigation**, **Manage pages**, **Manage products**), then create **four** webhooks under **Webhooks & Events**:

| Webhook | Target URL (`https://<domain>/…`) | Events |
| --- | --- | --- |
| Product | `/api/webhooks/saleor/products` | all `Product` events except *Export completed* |
| Menu | `/api/webhooks/saleor/menu` | all `Menu` events |
| Page | `/api/webhooks/saleor/page` | all `Page` events |
| Collection | `/api/webhooks/saleor/collections` | `Deleted` and `Updated` on `Collection` |

### Deployment (Vercel)
- Import the GitHub repo on Vercel (**Add New → Project**).
- Set **Root Directory** to `apps/storefront`, **Build Command** to `turbo run build --filter=storefront`, **Install Command** to `pnpm install`.
- Vercel does not use the local `.env` — define all required variables in the project (see [Environment Variables](/tech/nimara/Environment%20Variables.md)).
- **Node.js 22 or higher is required** — set it in Vercel project settings.
- Deploy, then use the dashboard to manage deployments, env vars, custom domains, logs, team access, preview password protection, and analytics.

For infrastructure-as-code deployment, see [Terraform Deployment](/tech/nimara/Terraform%20Deployment.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Terraform Deployment](/tech/nimara/Terraform%20Deployment.md)
[Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md)
[Content & Navigation](/tech/saleor/Content%20%26%20Navigation.md)
