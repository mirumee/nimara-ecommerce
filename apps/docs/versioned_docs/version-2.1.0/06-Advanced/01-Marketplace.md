---
id: marketplace
title: Marketplace
---

# Marketplace

This guide will help you set up the Nimara marketplace app in your local environment.

The marketplace is a vendor portal for managing products, orders, collections, and vendor pages in a multi-vendor e-commerce setup powered by Saleor.

### Fork and clone project

First, **fork** the Nimara repository to your own GitHub account.

Go to the [Nimara GitHub repo](https://github.com/mirumee/nimara-ecommerce).

Click the **Fork** button in the top-right corner.

Once the fork is created, clone your fork locally:

```bash
git clone https://github.com/{your_github_username}/nimara-ecommerce.git nimara-ecommerce
cd nimara-ecommerce
```

### Install project's dependencies

```bash
pnpm install
```

### Copy variables

The marketplace app has its own environment file. Copy it from **apps/marketplace/.env.example** to **apps/marketplace/.env**:

```bash
cp apps/marketplace/.env.example apps/marketplace/.env
```

### Add backend URL and set up environment variables

Use a free developer account at Saleor Cloud or run Saleor locally using Docker.

```properties
# Add backend address
NEXT_PUBLIC_SALEOR_API_URL=https://{your_domain}.saleor.cloud/graphql/

# Local example
# NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/
```

For a full list of required and optional variables, see the [Environment Variables Guide](../Quickstart/environment-variables).

### Run project

Run the development server:

```bash
pnpm dev:marketplace
```

The marketplace app runs on **port 3001** by default.

### Install the app in Saleor

The marketplace is a Saleor App and **must be installed** before it works — installation is what stores the app's auth token (used for all server-side Saleor calls) in the app-config store. Running the dev server alone is not enough.

1. **Start the app-config store (LocalStack).** With the default `MARKETPLACE_APP_CONFIG_PROVIDER=aws`, the auth token is read from / written to AWS Secrets Manager, which runs locally as LocalStack:

   ```bash
   cd apps/marketplace && pnpm localstack:up
   ```

2. **Expose the app publicly — only when Saleor cannot reach your machine.** Saleor Cloud (and any remote Saleor) must call back to the app's `tokenTargetUrl` during installation, so `http://localhost:3001` will not work. Open a tunnel to port `3001` (e.g. ngrok) and set the public origin so the manifest URLs are reachable:

   ```properties
   NEXT_PUBLIC_MARKETPLACE_VENDOR_URL=https://{your-tunnel}.ngrok.app
   ```

   Restart the dev server after changing it (`NEXT_PUBLIC_*` vars are read at startup). For a fully local Saleor on the same host, you can skip this step.

3. **Install from the manifest.** In the Saleor Dashboard go to **Apps → Install external app** and use the manifest URL:

   ```
   https://{your-tunnel}.ngrok.app/api/saleor/manifest
   ```

   (Use `http://localhost:3001/api/saleor/manifest` only if Saleor runs on the same host.) Install with an account that holds all the permissions the app requests — you can only grant permissions you have yourself.

On success the app appears in the Saleor app list as **Marketplace Vendor Panel**, and the auth token is persisted for your Saleor domain.

## Features

The marketplace app provides the following vendor-facing features:

- **Dashboard** - Overview of the vendor's store
- **Product Management** - Create, update, and manage products and variants
- **Order Management** - View and fulfill customer orders
- **Collections** - Organize products into collections
- **Drafts** - Manage draft products and pages
- **Vendor Pages** - Manage vendor profile pages and page status
- **Customer Management** - View and manage customers
- **Configuration** - Manage channels and general vendor settings
- **Payouts** - Track balances and payouts settled to the vendor's Stripe Connect account (see [Payouts and ledger](#payouts-and-ledger))

In addition, a super-admin area (`/app`) lets platform operators approve vendors, review payouts, and manage marketplace-wide options.

## Vendor onboarding flow

During public vendor sign-up, the marketplace app creates the Saleor vendor profile page and default vendor collection before registering the customer account. The vendor page is created as a draft with `isPublished: false`, then the customer account is linked to that page through the `vendor.id` customer metadata key.

The vendor page is published only after the vendor confirms their Saleor account from the account confirmation link. When confirmation succeeds and Saleor returns an active user, the marketplace app reads the customer's `vendor.id` metadata and updates the linked vendor page with `isPublished: true`.

## Payouts and ledger

The marketplace settles vendor earnings through **Stripe Connect** backed by a **Postgres ledger**. Vendors onboard a Stripe Connect account, Saleor webhooks (e.g. order paid) ingest ledger entries, and platform operators close and execute payout batches that create Stripe **Transfers** to each vendor's connected account. Settlement stops at Transfers; Stripe **Payout** objects (bank withdrawals from the Connect account) are not persisted.

This subsystem is optional and enabled by configuring `DATABASE_URL` and the Stripe Connect variables (see [Environment Variables](#environment-variables)). Apply the ledger schema with `pnpm migrate:ledger` from the repo root.

## i18n

The marketplace app also uses the shared i18n package described in the [i18n architecture docs](/Advanced/i18n). It passes `app: "marketplace"` to `@nimara/i18n`'s `createRequestConfig`, so it receives the `common` + `marketplace` message bundles (with locale-specific overrides applied where defined).

## Environment Variables

Key environment variables for the marketplace. See [apps/marketplace/.env.example](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/marketplace/.env.example) for the full, authoritative list.

**Saleor**

| Variable                                      | Description                                                                                                                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SALEOR_URL`                      | Saleor instance URL                                                                                                                                                                                         |
| `NEXT_PUBLIC_SALEOR_API_URL`                  | Saleor GraphQL API endpoint                                                                                                                                                                                 |
| `NEXT_PUBLIC_SALEOR_UI_APP_TOKEN`             | Saleor app token used by the marketplace UI                                                                                                                                                                 |
| `NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG` | Channel slug used by the marketplace (e.g. `default-channel`)                                                                                                                                               |
| `NEXT_PUBLIC_GRAPHQL_URL`                     | Marketplace GraphQL endpoint (default: `http://localhost:3001/api/graphql`)                                                                                                                                 |
| `NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL`      | Storefront URL the marketplace links to                                                                                                                                                                     |
| `NEXT_PUBLIC_MARKETPLACE_VENDOR_URL`          | Public origin of this app. Set to your tunnel URL (e.g. ngrok) when installing from a remote Saleor so the manifest's `tokenTargetUrl`/`appUrl`/webhooks are reachable. Leave unset for pure localhost dev. |

**App config**

| Variable                          | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `MARKETPLACE_PORT`                | Port the app runs on (default: `3001`)             |
| `MARKETPLACE_CORS_ORIGINS`        | Comma-separated allowed CORS origins               |
| `MARKETPLACE_APP_CONFIG_PROVIDER` | App config provider: `aws` or `edge`               |
| `SECRET_MANAGER_APP_CONFIG_PATH`  | Secrets Manager path for app config (AWS provider) |

**Ledger (Postgres)**

| Variable       | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string for the ledger and payout tables (required for payouts) |

**Stripe Connect (payouts)**

| Variable                                     | Description                                              |
| -------------------------------------------- | -------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                          | Stripe secret key                                        |
| `STRIPE_WEBHOOK_SIGNING_SECRET`              | Stripe webhook signing secret                            |
| `MARKETPLACE_STRIPE_CONNECT_WEBHOOK_SECRET`  | Signing secret for Stripe Connect webhooks               |
| `MARKETPLACE_STRIPE_CONNECT_DEFAULT_COUNTRY` | Default country for new Connect accounts (default: `US`) |

**Email (SMTP)**

| Variable                       | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `MARKETPLACE_SMTP_HOST`        | SMTP host used for sending marketplace emails                    |
| `MARKETPLACE_SMTP_PORT`        | SMTP port (default: `587`)                                       |
| `MARKETPLACE_SMTP_USER`        | SMTP username (optional, if your SMTP server requires auth)      |
| `MARKETPLACE_SMTP_PASSWORD`    | SMTP password (optional, if your SMTP server requires auth)      |
| `MARKETPLACE_SMTP_SECURE`      | Use TLS from the start (default: `false`)                        |
| `MARKETPLACE_EMAIL_FROM`       | From address, e.g. `"Nimara Marketplace <no-reply@example.com>"` |
| `MARKETPLACE_SUPERADMIN_EMAIL` | Email that receives new vendor registration notifications        |

**AWS (LocalStack for local development)**

| Variable           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `AWS_REGION`       | AWS region                                           |
| `AWS_ENDPOINT_URL` | AWS endpoint (for local development with LocalStack) |

## Deployment

### Connect GitHub Repository

Go to your projects on [Vercel](https://vercel.com/) → click **Add New** and select **Project**.

Choose your Nimara GitHub repository and click **Import**.

### Set up New Project

Select your **Vercel Team**, add **Project Name**, set **Root Directory** to `apps/marketplace`.

Set **Build Command** to `turbo run build --filter=marketplace` and **Install Command** to `pnpm install`.

### Configure Environment Variables

Add the required environment variables in Vercel:

- `NEXT_PUBLIC_SALEOR_URL`
- `NEXT_PUBLIC_SALEOR_API_URL`
- `NEXT_PUBLIC_SALEOR_UI_APP_TOKEN`
- `NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG`
- `NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL`
- `DATABASE_URL` (required for payouts and ledger)
- `STRIPE_SECRET_KEY` (required for payouts)
- `STRIPE_WEBHOOK_SIGNING_SECRET` (required for payouts)
- `MARKETPLACE_STRIPE_CONNECT_WEBHOOK_SECRET` (required for payouts)
- `MARKETPLACE_STRIPE_CONNECT_DEFAULT_COUNTRY` (optional, default `US`)
- `MARKETPLACE_SMTP_HOST` (optional, required only to send emails)
- `MARKETPLACE_SMTP_PORT` (optional)
- `MARKETPLACE_SMTP_USER` (optional)
- `MARKETPLACE_SMTP_PASSWORD` (optional)
- `MARKETPLACE_SMTP_SECURE` (optional)
- `MARKETPLACE_EMAIL_FROM` (optional, required only to send emails)
- `MARKETPLACE_SUPERADMIN_EMAIL` (optional, required only to notify admin on registration)

See [apps/marketplace/.env.example](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/marketplace/.env.example) for the full list, including app-config and AWS variables.

### Deploy

Click **Deploy** to deploy your marketplace app.
