---
id: stripe-integration
title: Stripe Integration
---

# Stripe Integration in Nimara

Nimara supports Stripe integration via a Saleor App. The Nimara Stripe App is a serverless **TypeScript**-based integration built with Next.js and intended for deployment on Vercel.

It supports:

- Stripe Payment Intents
- Multi-channel Stripe configuration
- Stripe Tax calculation
- Webhook setup via Stripe keys

### Prerequisites

Before proceeding, ensure you have:

- Access to your **Stripe account** (with API keys)
- Access to your **Saleor Dashboard**
- Access to your **Vercel account** — needed to _deploy_ the app. Running it
  locally does not require one; see [App Settings Storage](#app-settings-storage).

### Set Environment Variables

Add the following variables to your **.env** file in the `apps/stripe` directory.
Copy `apps/stripe/.env.example` to `apps/stripe/.env` as a starting point (run this
from the repo root):

```bash
cp apps/stripe/.env.example apps/stripe/.env
```

:::note
Your **Stripe keys are not set here.** They are entered per channel in the
app's dashboard UI _after_ installation (see [Install the App in Saleor](#install-the-app-in-saleor))
and persisted through the configured store (see [App Settings Storage](#app-settings-storage)).
:::

For local development against your own Saleor Cloud, two variables are enough:

```properties
CONFIG_PROVIDER=file
ALLOWED_DOMAINS=*
```

**`NEXT_PUBLIC_ENVIRONMENT`**

- **Description**: Environment type for error reporting and logging.
- **Example**: `LOCAL`, `STAGING`, `PRODUCTION`, etc.

**`NEXT_PUBLIC_SALEOR_API_URL`**

- **Description**: URL of the Saleor GraphQL API endpoint.
- **How to get it**: Saleor Cloud → **Projects** → select the relevant project → **Environment Details**.
- **Note**: Must end with a trailing slash `/graphql/`.
- **Example**: `https://your-domain.saleor.cloud/graphql/`

**`ALLOWED_DOMAINS`**

- **Description**: Comma separated list of Saleor domains allowed to install the app. `*` acts as a wildcard, so a whole Saleor Cloud space can be allowed with one entry. While unset, **every** installation is refused.
- **Example**: `nimara-*.eu.saleor.cloud,demo.nimara.store`. A bare `*` allows any Saleor and belongs in local development only.

**`CONFIG_PROVIDER`**

- **Description**: Where the app persists its settings. `file` writes them to a local JSON file; `edge` uses Vercel Edge Config. Defaults to `edge`.
- **Example**: `file`

**`CONFIG_FILE_PATH`**

- **Description**: `file` provider only. Path of the config file, relative to `apps/stripe`. Gitignored, and created owner-readable because it holds Stripe secret keys.
- **Default**: `.saleor-app-config.json`

**`VERCEL_TEAM_ID`**

- **Description**: The unique identifier of your Vercel team account. Required only when `CONFIG_PROVIDER=edge`.
- **How to get it**: Vercel Dashboard → **Settings** → **General** → copy the **Team ID**.

**`VERCEL_ACCESS_TOKEN`**

- **Description**: Personal Vercel API token used to read and write the Edge Config. Required only when `CONFIG_PROVIDER=edge`.
- **How to get it**: Vercel Dashboard → click your avatar and select **Account Settings** → select **Tokens** → **Create Token**.

**`VERCEL_EDGE_CONFIG_ID`**

- **Description**: ID of the Edge Config database where dynamic settings are stored. Required only when `CONFIG_PROVIDER=edge`.
- **How to get it**: Vercel Dashboard → open your project → **Storage** → click **Create Database** → select an **Edge Config** → copy its ID.

**`CONFIG_KEY`**

- **Description**: Key used to identify and store app-specific configuration in Edge Config. `edge` provider only.
- **How to get it**: Set this manually. It should be unique and descriptive.
- **Example**: `nimara-config`

### App Settings Storage

The app stores, per installed Saleor, the Saleor auth token and the per-channel
Stripe keys. `CONFIG_PROVIDER` selects where:

| Provider | Backing store      | Use for                                                  |
| -------- | ------------------ | -------------------------------------------------------- |
| `file`   | Local JSON file    | Local development. No Vercel account required.           |
| `edge`   | Vercel Edge Config | Any deployment. Default when `CONFIG_PROVIDER` is unset. |

:::warning
Do not deploy with `CONFIG_PROVIDER=file`. A serverless filesystem is ephemeral and
is not shared between instances, so installations would be lost between requests.
:::

### Running the App Locally

Saleor pushes the payment webhooks to the app, so it has to be reachable over the
public internet — your Saleor Cloud cannot call `localhost:4000`. Start the dev
server and expose it with a tunnel:

```bash
pnpm dev:stripe
# then, in another shell, point any tunnel of your choice
# (cloudflared, ngrok, untun, …) at port 4000
```

Install the app from the tunnel's URL, and keep the tunnel running while you test:
Saleor stores the app's URL at installation time, so a new tunnel URL means
reinstalling the app.

### Configure the Nimara Storefront

To enable checkout, point the storefront at the installed app (see
`apps/storefront/.env.example`). In your Nimara storefront, update the **.env** with:

```properties
# Must match the app id from the Stripe app's manifest: `<ENVIRONMENT>.stripe`.
NEXT_PUBLIC_PAYMENT_APP_ID=LOCAL.stripe
```

:::note
The storefront holds no Stripe key. The app reports the publishable key for the
channel being paid in with every payment or card-saving session it opens, so
per-channel Stripe accounts work without rebuilding the storefront.
:::

:::note
The app id is built as `<NEXT_PUBLIC_ENVIRONMENT>.stripe` (the `stripe` part
is the Stripe app's package name). So the `LOCAL` prefix changes with your
`NEXT_PUBLIC_ENVIRONMENT` — e.g. `STAGING.stripe`, `PRODUCTION.stripe`.
:::

### Deploy the App

Deploy the app to Vercel using the Vercel CLI or dashboard.

Once deployed, your app's manifest will be available at:

```
https://<your-app-domain>/api/saleor/manifest
```

### Install the App in Saleor

You can install the app via the manifest URL:

- From the Saleor Dashboard → **Extensions** → click **Add Extension** → select **Install From Manifest**.

The app requests `HANDLE_PAYMENTS` and `MANAGE_USERS`. It needs `MANAGE_USERS`
for [stored payment methods](https://docs.saleor.io/developer/payments/stored-payments):
it reads the customer a payment event belongs to and keeps the Saleor user ↔
Stripe customer mapping in the user's private metadata.

### Provide Stripe Keys

Once the app is installed, open it from the Saleor Dashboard and, for each channel,
provide your Stripe **secret** (`sk_...`) and **publishable** (`pk_...`) keys.

:::note
The Stripe webhooks are installed automatically when the keys are saved —
you do not need to configure them manually in Stripe.
:::

After the keys are saved, make sure the storefront's `NEXT_PUBLIC_PAYMENT_APP_ID`
is set (see [Configure the Nimara Storefront](#configure-the-nimara-storefront))
and restart it.

:::note
For detailed setup instructions, see the official docs:
[Nimara TypeScript Stripe App documentation](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/stripe/README.md)
:::
