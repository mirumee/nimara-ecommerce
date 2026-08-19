<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../docs/images/logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="../docs/images/logo.svg">
    <img width="200" alt="nimara logo" src="../docs/images/logo.svg">
  </picture>
  <h1>Saleor Stripe payment app</h1>
</div>

<div align="center">
  <strong>Stripe Payment app for Saleor — a Hono + Vite app that deploys to Vercel alongside the Nimara storefront.</strong>
</div>
<br />

## 🔧 Prerequisites

- You need to have a [Stripe](https://stripe.com/) account.

- You need to have a [Vercel](https://vercel.com/) account.

## ⚡ Quickstart

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

This is a **multi-tenant** app: one deployment serves every Saleor instance in
`ALLOWED_DOMAINS`, storing each tenant's config (install token + per-channel
Stripe keys) keyed by its domain. Edit `.env`:

- `ALLOWED_DOMAINS` - Comma-separated Saleor domains allowed to install the app.
  Wildcards allowed (`*.eu.saleor.cloud`, or `*` for any — never `*` in prod).

- `CONFIG_PROVIDER` - Where every installed Saleor's config is stored: `edge`
  (Vercel Edge Config) or `file` (local JSON, dev only — no Vercel account
  needed).

For `CONFIG_PROVIDER=edge` also set (Vercel dashboard):

- `VERCEL_TEAM_ID` - Settings tab.<br />![alt text](docs/team-id.png)
- `VERCEL_ACCESS_TOKEN` - [access token](https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token) from your [dashboard](https://vercel.com/account/settings/tokens).
- `VERCEL_EDGE_CONFIG_ID` - Storage tab (create an Edge Config if needed).![alt text](docs/edge-config.png)

Now in [**nimara storefront**](../storefront) set `NEXT_PUBLIC_PAYMENT_APP_ID`
to `LOCAL.stripe` in its `.env`.

**Note** the `LOCAL` prefix follows your `ENVIRONMENT` variable.

## 🚀 Development

Each app is a [Hono](https://hono.dev) server with an optional Vite-built React
config UI. Apps live under `src/apps/<name>/`:

- `entry-server.ts` — the Hono app; exports `app` (Vercel/dev) and `handler`
  (AWS Lambda).
- `entry-client.tsx` — the React config UI (optional; omit for an API-only app).

```bash
pnpm dev            # vite dev server (Hono via @hono/vite-dev-server) on :4000
pnpm build          # per-app build (see Build targets below)
pnpm test           # vitest
pnpm lint:types     # tsc --noEmit
```

### Auto-discovery

Both dev and build **auto-discover** `src/apps/*` — adding an app dir needs no
config change.

- **Dev** (`src/dev-server.ts`, vite `import.meta.glob`): a single app is
  served at `/`; with multiple apps each runs under `/<app>` (the dev server
  sets each app's `BASE_PATH`, so its routes/manifest/assets stay correct).
- **Build** (`etc/build.ts`): one Vite pass **per app** so every app bundles
  into a single self-contained file — no shared chunks between apps.

### Base path

An app self-prefixes all routes and the URLs it advertises (manifest, client
assets) with `BASE_PATH` — empty at root, `/stripe` behind a gateway, or set
per app in multi-app dev. `/healthcheck` and the manifest `targetUrl`s resolve
under it.

### Build targets

`BUILD_TARGET` is read from the environment and validated against the two values
below. It has no default — unset, empty, or unknown fails the build rather than
guessing a layout the deploy target cannot serve, so it must be set locally
(`.env`) and in every deployment:

- `vercel` — client → `public/assets/<app>-entry-client.js` (CDN),
  server → `dist/<app>/entry-server.js`. The root `index.js` re-exports the
  built app for the native **Hono framework preset**.
- `node` — each app self-contained in `dist/<app>/` (`entry-server.js` +
  `assets/`), for AWS Lambda + S3/CloudFront.

### Architecture (DDD-ish)

- `src/apps/*` — presentation: Hono routes + the React UI per app.
- `src/domain` — pure types/schemas (payment, config).
- `src/use-cases` — application use-cases + services.
- `src/infrastructure` — app-specific adapters (Stripe API, webhook endpoints).
- `src/container` — [iti](https://itijs.org) composition root wiring ports to
  adapters; routes only pull use-cases from the container.
- Shared Saleor machinery lives in `@nimara/infrastructure`: `apps/saleor`
  (install use-case, config repo, client), `jose` (JWKS + verification),
  `config` (Vercel Edge Config).

## ⚙️ Installation

Once everything is set up and the App is running, the manifest can be found under `/api/saleor/manifest`.

To install it on [Saleor Cloud](https://cloud.saleor.io) you can:

- Use the following link, just remember to replace the Saleor domain & app domain accordingly:
  [https://YOUR-SALEOR-CLOUD-DOMAIN.eu.saleor.cloud/dashboard/apps/install?manifestUrl=https://YOUR-APP-DOMAIN/api/saleor/manifest](https://YOUR-CLOUD-DOMAIN.eu.saleor.cloud/dashboard/apps/install?manifestUrl=https://YOUR-APP-DOMAIN/api/saleor/manifest)

- Go to the [apps dashboard](https://YOUR-SALEOR-CLOUD-DOMAIN.eu.saleor.cloud/dashboard/apps/) and click `Install external app`. There just provide the manifest URL of the app.

Once successfully installed, just provide correct private & public keys from your Stripe account.
<br />
**Note** that the webhooks will be installed automatically when the keys are provided.

<div align="center">
  <picture>
    <img  width="700" alt="nimara logo" src="docs/ui.png">
  </picture>
</div>

<br/>

<div align="center">
  <strong>Crafted with ❤️ by Mirumee Software</strong>

[hello@mirumee.com](mailto:hello@mirumee.com)

</div>
