---
type: "Technical Reference"
title: "Marketplace"
description: "The Nimara marketplace app — a multi-vendor Saleor-backed vendor portal: setup, vendor-facing features, the vendor onboarding flow, its i18n and environment variables, and deployment."
tags:
  - "nimara"
  - "marketplace"
  - "vendor"
  - "reference"
resource: "/sources/nimara-docs/marketplace.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/marketplace.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

The marketplace (`apps/marketplace`) is a **vendor portal** for managing products, orders, collections, and vendor pages in a multi-vendor setup powered by Saleor (source: [marketplace](/sources/nimara-docs/marketplace.mdx)).

### Setup
Fork/clone the [repo](https://github.com/mirumee/nimara-ecommerce), `pnpm install`, `cp .env.example .env`, set `NEXT_PUBLIC_SALEOR_API_URL`, then `pnpm dev:marketplace`. The app runs on **port 3001** by default. It passes `app: "marketplace"` to `@nimara/i18n`'s `createRequestConfig`, receiving the `common` + `marketplace` bundles — see [Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md).

### Vendor-facing features
- **Product management** — create/update products and variants.
- **Order management** — view and fulfill customer orders.
- **Collections** — organize products into collections.
- **Vendor pages** — manage vendor profile pages and their status.
- **Customer management** — view and manage customers.

### Vendor onboarding flow
During public vendor sign-up the app creates the Saleor **vendor profile page** and a **default vendor collection** *before* registering the customer account. The vendor page is created as a draft (`isPublished: false`), then the customer account is linked to it via the `vendor.id` customer metadata key. The page is **published only after** the vendor confirms their Saleor account from the confirmation link: on success (Saleor returns an active user), the app reads the customer's `vendor.id` metadata and updates the linked page to `isPublished: true`.

### Environment variables
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SALEOR_API_URL` | Saleor GraphQL endpoint |
| `AWS_SECRETS_MANAGER_ENDPOINT` | AWS Secrets Manager endpoint (local dev with LocalStack) |
| `MARKETPLACE_SMTP_HOST` | SMTP host for marketplace emails |
| `MARKETPLACE_SMTP_PORT` | SMTP port (default `587`) |
| `MARKETPLACE_SMTP_USER` / `MARKETPLACE_SMTP_PASSWORD` | SMTP auth (optional) |
| `MARKETPLACE_SMTP_SECURE` | TLS from the start (default `false`) |
| `MARKETPLACE_EMAIL_FROM` | From address, e.g. `"Nimara Marketplace <no-reply@example.com>"` |
| `MARKETPLACE_SUPERADMIN_EMAIL` | receives new-vendor registration notifications |

The storefront-side marketplace switches (`NEXT_PUBLIC_MARKETPLACE_ENABLED`, vendor/storefront URLs, marketplace channel slug) are in [Environment Variables](/tech/nimara/Environment%20Variables.md).

### Deployment (Vercel)
Import the repo, set **Root Directory** to `apps/marketplace`, **Build Command** to `turbo run build --filter=marketplace`, **Install Command** `pnpm install`, add the required env vars (SMTP and superadmin vars are optional, needed only for email/notifications), and deploy.

> This is the platform-docs view of the marketplace. Deeper operational detail (the Postgres ledger, payout batches, and Stripe Connect Transfers) lives in the repo `AGENTS.md`; the docs bundle does not cover it, so treat that as out of scope for this source-derived note.

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md)
[Marketplace Vendor](/product/personas/Marketplace%20Vendor.md)
[Orders & Fulfillment](/tech/saleor/Orders%20%26%20Fulfillment.md)
