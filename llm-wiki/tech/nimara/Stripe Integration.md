---
type: "Technical Reference"
title: "Stripe Integration"
description: "Nimara's two Stripe payment apps (Saleor Apps) — a Python service and a TypeScript/Next.js app — their env vars, webhook and manifest install steps, and deployment options."
tags:
  - "nimara"
  - "stripe"
  - "payments"
  - "saleor-app"
  - "reference"
resource: "/sources/nimara-docs/stripe-integration.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/stripe-integration.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Nimara supports Stripe via a **Saleor App**, in two interchangeable flavours (source: [stripe-integration](/sources/nimara-docs/stripe-integration.mdx)). Both support Stripe Payment Intents, multi-channel Stripe config, Stripe Tax, and webhook setup via Stripe keys. Payment maps to Saleor's transaction API — see [Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md).

### Storefront variables (both options)
Set in the storefront (see [Environment Variables](/tech/nimara/Environment%20Variables.md)):
- `STRIPE_SECRET_KEY` — Stripe server-side secret (Stripe Dashboard → Developers → API keys).
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` — client-side Stripe key.
- `NEXT_PUBLIC_PAYMENT_APP_ID` — the Saleor Payment App integration ID (available after installing the app; e.g. `LOCAL.nimara-ts-stripe`, prefix varies by `NEXT_PUBLIC_ENVIRONMENT`).

### Option 1 — Python Stripe app
Standalone Python service ([mirumee/nimara-stripe](https://github.com/mirumee/nimara-stripe)), installed in Saleor via a manifest URL and connected over webhooks.
1. Set the storefront Stripe variables above.
2. Deploy the app (Docker or AWS Lambda, below).
3. Configure Stripe webhooks — Stripe Dashboard → Developers → Webhooks → Add destination → select all Payment Intent events → endpoint `https://<stripe-app-domain>/payment/webhook`; copy the **Signing secret** into the app config in Saleor.
4. Install in Saleor — Extensions → Add Extension → Install From Manifest → paste `https://<stripe-app-url>/saleor/manifest`.

Deployment: **Docker** (`docker run -p 8080:8080 ghcr.io/mirumee/nimara-stripe:latest`) or **AWS Lambda** via the provided Terraform (`cp terraform.tfvars.example terraform.tfvars`, `make all`, then `aws-vault exec … -- make init/plan`). See the [Python app deployment docs](https://github.com/mirumee/nimara-stripe/blob/main/docs/DEPLOYMENT.md).

### Option 2 — TypeScript Stripe app
Serverless Next.js app in `apps/stripe`, intended for Vercel.
- Set variables in `apps/stripe/.env`: `NEXT_PUBLIC_ENVIRONMENT`, `NEXT_PUBLIC_SALEOR_API_URL` (trailing `/graphql/`), `VERCEL_TEAM_ID`, `VERCEL_ACCESS_TOKEN`, `VERCEL_EDGE_CONFIG_ID`, `CONFIG_KEY` (e.g. `nimara-config`).
- In the storefront, set `NEXT_PUBLIC_PAYMENT_APP_ID=LOCAL.nimara-ts-stripe` (prefix varies by environment).
- Deploy to Vercel; the manifest is served at `https://<app-domain>/api/saleor/manifest`.
- Install in Saleor via that manifest (direct install link or Extensions → Add Extension → Install From Manifest). See the [TS app README](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/stripe/README.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md)
[Apps, Webhooks & Extensibility](/tech/saleor/Apps%20Webhooks%20%26%20Extensibility.md)
