<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../docs/images/logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="../docs/images/logo.svg">
    <img width="200" alt="nimara logo" src="../docs/images/logo.svg">
  </picture>
  <h1>Saleor Stripe payment app</h1>
</div>

<div align="center">
  <strong>Stripe Payment app for Saleor which can be deployed to your Vercel along side with the Nimara storefront.</strong>
</div>
<br />

## 🔧 Prerequisites

- You need to have a [Stripe](https://stripe.com/) account.

- You need to have a [Vercel](https://vercel.com/) account **to deploy**. Running the app locally does not require one.

## ⚡ Quickstart

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

For local development that is almost all you need — two variables:

```properties
# Store the app's settings in a local, gitignored JSON file instead of Vercel Edge Config.
CONFIG_PROVIDER=file
# Allow any Saleor to install the app. Local development only.
ALLOWED_DOMAINS=*
```

- `CONFIG_PROVIDER` - Where the app persists its settings (per installed Saleor: the auth token and the per-channel Stripe keys). `file` writes them to `CONFIG_FILE_PATH` (`.saleor-app-config.json` by default), so no Vercel account is needed. `edge` uses Vercel Edge Config and is required for any deployment, because a serverless filesystem is ephemeral and not shared between instances. Defaults to `edge`.

- `ALLOWED_DOMAINS` - Comma separated list of Saleor domains allowed to install the app, e.g. `nimara-*.eu.saleor.cloud,demo.nimara.store`, where `*` acts as a wildcard. Unset, every installation is refused, so set it before deploying. A bare `*` allows any Saleor and belongs in local development only.

### Deploying (`CONFIG_PROVIDER=edge`)

These three are required when, and only when, `CONFIG_PROVIDER=edge`:

- `VERCEL_TEAM_ID` - Your Vercel Team ID which can be found in your Vercel dashboard project > Settings tab.<br />
  ![alt text](docs/team-id.png)

- `VERCEL_ACCESS_TOKEN` - Your [Vercel access token](https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token) which can be found in your [Vercel dashboard](https://vercel.com/account/settings/tokens). This is required to properly save app's settings upon installation.

- `VERCEL_EDGE_CONFIG_ID` - Your Vercel Edge config database ID. If you don't have an Edge config database you need to create one. This can be found in your Vercel dashboard project > Storage tab.![alt text](docs/edge-config.png)

### Reaching a locally running app from Saleor

Saleor pushes the payment webhooks to the app, so it has to reach it over the
public internet — a hosted Saleor cannot call `localhost:4000`. Expose the dev
server with a tunnel and install the app from the tunnel's URL:

```bash
pnpm dev:stripe
# then, in another shell, point any tunnel of your choice
# (cloudflared, ngrok, untun, …) at port 4000
```

Now in [**nimara storefront**](../storefront) environment variables set `NEXT_PUBLIC_PAYMENT_APP_ID` to `LOCAL.stripe` in your `.env` file.

**Note** that the `LOCAL` environment prefix may change depending on your `NEXT_PUBLIC_ENVIRONMENT` environment variable.

## ⚙️ Installation

One deployment serves any number of Saleor instances. Each installation stores its own auth token and per-channel Stripe keys under its Saleor domain, and every request is routed to the right tenant by the `saleor-api-url` header Saleor sends. `ALLOWED_DOMAINS` decides which Saleor instances may install it; until it is set, all of them are refused.

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
