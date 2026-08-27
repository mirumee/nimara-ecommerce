---
id: marketplace
title: Marketplace
---

# Marketplace

This guide explains how to set up the Nimara marketplace app in a local environment.

The marketplace is a vendor portal for products, orders, collections, and vendor pages in a
multi-vendor setup powered by Saleor. It runs on port 3001.

The marketplace is also a Saleor App. You must install it in Saleor before it works. The
installation stores the app auth token that every server-side Saleor call uses. A running dev
server alone is not enough.

## Local setup

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

The marketplace app has its own environment file. Copy it from **apps/marketplace/.env.example**
to **apps/marketplace/.env**:

```bash
cp apps/marketplace/.env.example apps/marketplace/.env
```

Three values need your input: `NEXT_PUBLIC_SALEOR_URL`, `ALLOWED_SALEOR_DOMAINS`, and
`STRIPE_SECRET_KEY`. The first section of the file holds them. Every other value is a working
local default or is optional.

### Add the backend URL

Use a free developer account at Saleor Cloud, or run Saleor locally with Docker.

The marketplace app reads `NEXT_PUBLIC_SALEOR_URL`. The GraphQL server throws an error at
startup if the variable is missing. Set the instance origin, without a path:

```properties
NEXT_PUBLIC_SALEOR_URL=https://{your_domain}.saleor.cloud

# Local example
# NEXT_PUBLIC_SALEOR_URL=http://localhost:8000
```

`NEXT_PUBLIC_SALEOR_API_URL` is a different variable. The marketplace app does not read it.
Code generation reads it from **apps/storefront/.env**.

For a full list of variables, see [Environment Variables](#environment-variables) below and the
[Environment Variables Guide](../Quickstart/environment-variables).

### Restrict the domains that can install the app

`ALLOWED_SALEOR_DOMAINS` holds a comma-separated list of Saleor hosts that can install the app.
Set the host of your instance, without a scheme and without a path:

```properties
ALLOWED_SALEOR_DOMAINS=nimara-stage.eu.saleor.cloud
```

An unset list accepts an installation request from any Saleor instance. Every deployed
environment must set this variable.

### Start the local services

The marketplace uses three containers, defined in **apps/marketplace/docker-compose.yml**. Run
these commands from the repository root:

```bash
pnpm localstack:up    # app config store, port 4566
pnpm db-ledger:up     # Postgres ledger, port 5434
pnpm mailpit:up       # SMTP sink, ports 1025 and 8025
```

LocalStack holds the app auth token. With the default `MARKETPLACE_APP_CONFIG_PROVIDER=aws`, the
token is read from and written to AWS Secrets Manager, which LocalStack emulates.

Mailpit receives the emails that the marketplace sends. Open the Mailpit inbox at
[http://localhost:8025](http://localhost:8025).

### Apply the ledger schema

The Postgres ledger is optional. See [Payouts and ledger](#payouts-and-ledger). If
`DATABASE_URL` is set, apply the schema from the repository root:

```bash
pnpm migrate:ledger
```

The command creates the ledger, payout, and Stripe settlement tables.

### Run project

Run the development server:

```bash
pnpm dev:marketplace
```

The marketplace app runs on **port 3001** by default.

### Expose the app with a tunnel

Saleor Cloud, and any remote Saleor, must reach the app during installation. It calls the
`tokenTargetUrl` from the manifest, so `http://localhost:3001` does not work.

Open a tunnel to port `3001`, for example with ngrok. Then set the public origin, so the
manifest URLs are reachable:

```properties
NEXT_PUBLIC_MARKETPLACE_VENDOR_URL=https://{your-tunnel}.ngrok.app
```

Restart the dev server after the change. Next.js reads `NEXT_PUBLIC_*` variables at startup, and
it also derives its `allowedDevOrigins` entry from this value. Without that entry, Next.js blocks
its own development resources for the tunnel host and the app stays on a loading spinner.

Verify that the tunnel serves the manifest:

```bash
curl -o /dev/null -w "%{http_code}\n" https://{your-tunnel}.ngrok.app/api/saleor/manifest
```

A `200` response means that you can install the app. For a Saleor instance on the same host, you
can skip the tunnel.

### Install the app in Saleor

In the Saleor Dashboard go to **Apps → Install external app** and use the manifest URL:

```
https://{your-tunnel}.ngrok.app/api/saleor/manifest
```

Use `http://localhost:3001/api/saleor/manifest` only if Saleor runs on the same host.

The manifest requests nine permissions: `IMPERSONATE_USER`, `MANAGE_PAGES`,
`MANAGE_PAGE_TYPES_AND_ATTRIBUTES`, `MANAGE_PRODUCTS`, `MANAGE_USERS`, `MANAGE_ORDERS`,
`MANAGE_SHIPPING`, `MANAGE_CHANNELS`, and `HANDLE_PAYMENTS`. Install with an account that holds
all of them. You can only grant a permission that you hold yourself.

On success the app appears in the Saleor app list as **Marketplace Vendor Panel**, and the auth
token is persisted for your Saleor domain.

The installation also creates the **Vendor Profile** model, which is a Saleor page type with the
slug `vendor-profile` and its attributes. The **Options** tab in the super-admin area repeats
this step by hand when a model is missing.

### Set up Stripe Connect

The vendor panel requires a connected Stripe Connect account. The authenticated layout redirects
every vendor without one to an onboarding screen, so the dashboard stays out of reach until the
onboarding completes.

Set at least the secret key, then restart the dev server:

```properties
STRIPE_SECRET_KEY=sk_test_{your_key}
```

The onboarding screen also offers a manual status sync, so you can complete a local onboarding
without the Stripe webhook secrets.

Stripe returns the vendor to the value of `NEXT_PUBLIC_MARKETPLACE_VENDOR_URL`, which is the
tunnel host, not localhost.

## Features

The marketplace app provides the following vendor-facing features:

- **Dashboard** - Overview of the vendor's store
- **Product Management** - Create, update, and manage products and variants
- **Order Management** - View and fulfill customer orders
- **Collections** - Organize products into collections
- **Drafts** - Manage draft products and pages
- **Customer Management** - View and manage customers
- **Configuration** - Manage channels, addresses, branding, and general vendor settings

The first six features have an entry in the top navigation. Configuration opens from the user
menu.

A super-admin area at `/app` lets platform operators approve or reject vendors, review the payout
overview, and bootstrap the vendor profile model. The manifest mounts it in the Saleor Dashboard
catalog navigation as **Marketplace**. Payout data is visible in this area only. The vendor panel
has no payouts page.

## Vendor onboarding flow

During public vendor sign-up, the marketplace app creates the Saleor vendor profile page and the
default vendor collection before it registers the customer account. The vendor page is created as
a draft with `isPublished: false`. The app then links the customer account to that page through
the `vendor.id` customer metadata key.

Saleor sends the account confirmation email, because the sign-up mutation passes a `redirectUrl`
that points at the app's `/account-confirm` route. That email does not reach Mailpit.

The vendor page is published only after the vendor confirms the Saleor account. When confirmation
succeeds and Saleor returns an active user, the marketplace app reads the customer's `vendor.id`
metadata and updates the linked vendor page with `isPublished: true`.

The marketplace app sends three emails over SMTP:

- a new vendor registration notice to `MARKETPLACE_SUPERADMIN_EMAIL`,
- a vendor accepted notice,
- a vendor rejected notice.

A super-admin sets the vendor decision in the `/app` area, which writes the `vendor-status`
attribute on the vendor profile page and sends the matching email. The status is informational.
It does not block sign-in to the vendor panel.

## Payouts and ledger

The marketplace settles vendor earnings through **Stripe Connect**, backed by a **Postgres
ledger**. Vendors onboard a Stripe Connect account, Saleor webhooks such as order paid ingest
ledger entries, and platform operators close and execute payout batches. A batch creates Stripe
**Transfers** to each vendor's connected account. Settlement stops at Transfers. Stripe
**Payout** objects, which are bank withdrawals from the Connect account, are not persisted.

This subsystem is optional. It activates when `DATABASE_URL` is set. Apply the schema with
`pnpm migrate:ledger` from the repository root.

Without `DATABASE_URL` the app keeps running and the ledger paths degrade in a defined way:

- Stripe Connect onboarding skips the vendor account row, so the vendor panel still works.
- The order paid webhook returns a `skipped` status, and it names `DATABASE_URL` as the reason.
- The payouts overview endpoint returns `configured: false` with empty lists.
- `pnpm migrate:ledger` prints a warning and applies nothing.

Payouts therefore need `DATABASE_URL` and the Stripe Connect variables. The rest of the vendor
panel does not.

## i18n

The marketplace app also uses the shared i18n package described in the [i18n architecture
docs](/Advanced/i18n). It passes `app: "marketplace"` to `@nimara/i18n`'s `createRequestConfig`,
so it receives the `common` + `marketplace` message bundles, with locale-specific overrides
applied where defined.

## Environment Variables

Key environment variables for the marketplace. See
[apps/marketplace/.env.example](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/marketplace/.env.example)
for the full, authoritative list.

**Saleor**

| Variable                                      | Description                                                                                                                                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SALEOR_URL`                      | Saleor instance URL. Required. The GraphQL server throws an error without it                                                                                                                               |
| `NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG` | Channel slug used by the marketplace, for example `default-channel`                                                                                                                                        |
| `NEXT_PUBLIC_GRAPHQL_URL`                     | Marketplace GraphQL endpoint (default: `http://localhost:3001/api/graphql`)                                                                                                                                |
| `NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL`      | Storefront URL the marketplace links to (default: `http://localhost:3000`)                                                                                                                                 |
| `NEXT_PUBLIC_MARKETPLACE_VENDOR_URL`          | Public origin of this app. Set it to your tunnel URL when you install from a remote Saleor, so the manifest URLs and the Next.js dev-origin allowance are reachable. Leave it unset for pure localhost dev |
| `ALLOWED_SALEOR_DOMAINS`                      | Comma-separated Saleor hosts allowed to install the app. An unset list accepts any domain                                                                                                                  |

**App config**

| Variable                          | Description                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| `MARKETPLACE_NODE_ENV`            | `development`, `production`, or `test` (default: `development`) |
| `MARKETPLACE_PORT`                | Port the app runs on (default: `3001`)                          |
| `MARKETPLACE_BASE_PATH`           | Base path the app is served under (default: empty)              |
| `MARKETPLACE_CORS_ORIGINS`        | Comma-separated allowed CORS origins                            |
| `LOG_LEVEL`                       | `debug`, `info`, `warn`, or `error` (default: `info`)           |
| `MARKETPLACE_APP_CONFIG_PROVIDER` | App config provider: `aws` or `edge` (default: `aws`)           |
| `SECRET_MANAGER_APP_CONFIG_PATH`  | Secrets Manager path for app config (AWS provider)              |
| `MARKETPLACE_APP_CONFIG_EDGE_KEY` | Edge Config key for app config (edge provider)                  |

**Ledger (Postgres)**

| Variable       | Description                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string for the ledger and payout tables. Required for payouts only |

**Stripe Connect (payouts)**

| Variable                                     | Description                                               |
| -------------------------------------------- | --------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                          | Stripe secret key. Required for vendor onboarding         |
| `STRIPE_PUBLIC_KEY`                          | Stripe publishable key                                    |
| `STRIPE_WEBHOOK_SIGNING_SECRET`              | Signing secret for the marketplace Stripe payment webhook |
| `MARKETPLACE_STRIPE_CONNECT_WEBHOOK_SECRET`  | Signing secret for Stripe Connect webhooks                |
| `MARKETPLACE_STRIPE_CONNECT_DEFAULT_COUNTRY` | Default country for new Connect accounts (default: `US`)  |

**Email (SMTP)**

| Variable                       | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `MARKETPLACE_SMTP_HOST`        | SMTP host used for sending marketplace emails                    |
| `MARKETPLACE_SMTP_PORT`        | SMTP port (default: `587`)                                       |
| `MARKETPLACE_SMTP_USER`        | SMTP username, if your SMTP server requires auth                 |
| `MARKETPLACE_SMTP_PASSWORD`    | SMTP password, if your SMTP server requires auth                 |
| `MARKETPLACE_SMTP_SECURE`      | Use TLS from the start (default: `false`)                        |
| `MARKETPLACE_EMAIL_FROM`       | From address, e.g. `"Nimara Marketplace <no-reply@example.com>"` |
| `MARKETPLACE_SUPERADMIN_EMAIL` | Email that receives new vendor registration notifications        |

**AWS (LocalStack for local development)**

| Variable                | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS access key id (default: `test`, which LocalStack accepts) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key (default: `test`)                       |
| `AWS_REGION`            | AWS region                                                    |
| `AWS_ENDPOINT_URL`      | AWS endpoint, for local development with LocalStack           |

## Deployment

### Connect GitHub Repository

Go to your projects on [Vercel](https://vercel.com/) → click **Add New** and select **Project**.

Choose your Nimara GitHub repository and click **Import**.

### Set up New Project

Select your **Vercel Team**, add **Project Name**, set **Root Directory** to `apps/marketplace`.

Set **Build Command** to `turbo run build --filter=marketplace` and **Install Command** to
`pnpm install`.

### Configure Environment Variables

Add the required environment variables in Vercel:

- `NEXT_PUBLIC_SALEOR_URL`
- `NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG`
- `NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL`
- `ALLOWED_SALEOR_DOMAINS` (an unset list accepts an installation from any Saleor instance)
- `STRIPE_SECRET_KEY` (required for vendor onboarding)
- `DATABASE_URL` (required for payouts and ledger)
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

See
[apps/marketplace/.env.example](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/marketplace/.env.example)
for the full list, including app-config and AWS variables.

### Deploy

Click **Deploy** to deploy your marketplace app.
