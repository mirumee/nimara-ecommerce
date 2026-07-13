---
type: "Technical Reference"
title: "Environment Variables"
description: "The required and optional environment variables for the Nimara storefront, and how setting them progressively lights up commerce, marketplace, payments, and search."
tags:
  - "nimara"
  - "configuration"
  - "environment-variables"
  - "reference"
resource: "/sources/nimara-docs/environment-variables.md"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/environment-variables.md) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Every environment variable the Nimara storefront reads (source: [environment-variables](/sources/nimara-docs/environment-variables.md)). Run `pnpm preflight` to see which are currently active.

### How features light up
The storefront boots empty and gains capabilities as variables are set:

| Set… | Get… |
| --- | --- |
| nothing | every page renders with empty data (design/demo). |
| `NEXT_PUBLIC_SALEOR_API_URL` | full commerce surface — cart, checkout, products, search, account. |
| `NEXT_PUBLIC_MARKETPLACE_ENABLED=true` | vendor-aware [marketplace](/tech/nimara/Marketplace.md) behaviour. |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` + `NEXT_PUBLIC_PAYMENT_APP_ID` | payments (see [Stripe Integration](/tech/nimara/Stripe%20Integration.md)). |
| `SALEOR_APP_TOKEN` | server-side access to resources hidden from anonymous users (e.g. unpublished pages). |

### Required variables
**Saleor**
- `NEXT_PUBLIC_SALEOR_API_URL` — Saleor GraphQL endpoint; must end with a trailing `/graphql/`. From Saleor Cloud → Projects → Environment Details.
- `NEXT_PUBLIC_DEFAULT_CHANNEL` — default [channel](/tech/nimara/Channels%20%26%20Markets.md) slug (e.g. `default-channel`). From Saleor dashboard → Configuration → Channels.
- `SALEOR_APP_TOKEN` — auth token for Saleor requests; created via an Extension with **Handle checkouts** and **Manage Customers** permissions.

**Auth**
- `AUTH_SECRET` — session encryption secret for Auth.js (a random secure string).
- `AUTH_URL` — Auth.js base URL for callback handling; required when **not** deploying on Vercel.

**Environment**
- `NEXT_PUBLIC_ENVIRONMENT` — environment type for error reporting/logging (`LOCAL`, `STAGING`, `PRODUCTION`, …).

**Stripe** — see [Stripe Integration](/tech/nimara/Stripe%20Integration.md).

**Marketplace**
- `NEXT_PUBLIC_MARKETPLACE_ENABLED` (`true`/`false`, default `false`) — enable marketplace UI/behaviour.
- `NEXT_PUBLIC_MARKETPLACE_VENDOR_URL` — vendor portal URL (e.g. `http://localhost:3001`).
- `NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL` — storefront URL for marketplace↔storefront communication.
- `NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG` — Saleor channel slug for marketplace data.

### Optional variables
- **General:** `NEXT_PUBLIC_STOREFRONT_URL` — public storefront URL for absolute links (sitemap, OpenGraph); defaults to the Vercel build URL or localhost.
- **Testing (Playwright):** `TEST_ENV_URL`, `USER_EMAIL`, `USER_PASSWORD`.
- **Logging:** `LOG_LEVEL` (`debug` | `info` | `warn` | `error` | `critical`, default `debug`).
- **Sentry:** `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_DEBUG`.
- **Images:** `NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT` (`AVIF`, `WEBP`).
- **Search:** `NEXT_PUBLIC_SEARCH_SERVICE` (`SALEOR` | `ALGOLIA`, default `SALEOR`); when `ALGOLIA`, also `NEXT_PUBLIC_ALGOLIA_APP_ID` and `NEXT_PUBLIC_ALGOLIA_API_KEY`.

The marketplace app has its own variables (SMTP, AWS Secrets Manager, superadmin email) — see [Marketplace](/tech/nimara/Marketplace.md). UCP requires no additional variables — see [UCP Integration](/tech/nimara/UCP%20Integration.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Local Development & Workflow](/tech/nimara/Local%20Development%20%26%20Workflow.md)
[Stripe Integration](/tech/nimara/Stripe%20Integration.md)
[Marketplace](/tech/nimara/Marketplace.md)
[Channels & Markets](/tech/nimara/Channels%20%26%20Markets.md)
