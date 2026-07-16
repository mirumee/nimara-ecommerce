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

## Use the TypeScript Stripe App

The Nimara Stripe App is a serverless TypeScript-based integration built with Next.js and intended for deployment on Vercel.

### Prerequisites

Before proceeding, ensure you have:

- Access to your **Stripe account** (with API keys)
- Access to your **Saleor Dashboard**
- Access to your **Vercel account**

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
and stored in Vercel Edge Config — which is why the `VERCEL_*` variables below are required.
:::

**`NEXT_PUBLIC_ENVIRONMENT`**

- **Description**: Environment type for error reporting and logging.
- **Example**: `LOCAL`, `STAGING`, `PRODUCTION`, etc.

**`NEXT_PUBLIC_SALEOR_API_URL`**

- **Description**: URL of the Saleor GraphQL API endpoint.
- **How to get it**: Saleor Cloud → **Projects** → select the relevant project → **Environment Details**.
- **Note**: Must end with a trailing slash `/graphql/`.
- **Example**: `https://your-domain.saleor.cloud/graphql/`

**`VERCEL_TEAM_ID`**

- **Description**: The unique identifier of your Vercel team account.
- **How to get it**: Vercel Dashboard → **Settings** → **General** → copy the **Team ID**.

**`VERCEL_ACCESS_TOKEN`**

- **Description**: Personal Vercel API token used to authenticate automated deployments or API calls.
- **How to get it**: Vercel Dashboard → click your avatar and select **Account Settings** → select **Tokens** → **Create Token**.

**`VERCEL_EDGE_CONFIG_ID`**

- **Description**: ID of the Edge Config database where dynamic settings are stored.
- **How to get it**: Vercel Dashboard → open your project → **Storage** → click **Create Database** → select an **Edge Config** → copy its ID.

**`CONFIG_KEY`**

- **Description**: Key used to identify and store app-specific configuration in Edge Config.
- **How to get it**: Set this manually. It should be unique and descriptive.
- **Example**: `nimara-config`

### Configure the Nimara Storefront

To enable checkout, the storefront needs all three payment variables set together
(see `apps/storefront/.env.example`). In your Nimara storefront, update the **.env** with:

```properties
# Must match the app id from the Stripe app's manifest: `<ENVIRONMENT>.stripe`.
NEXT_PUBLIC_PAYMENT_APP_ID=LOCAL.stripe
# Your Stripe publishable key (pk_...).
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
# Your Stripe secret key (sk_...), server-only.
STRIPE_SECRET_KEY=
```

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

### Provide Stripe Keys

Once the app is installed, open it from the Saleor Dashboard and, for each channel,
provide your Stripe **secret** (`sk_...`) and **publishable** (`pk_...`) keys.

:::note
The Stripe webhooks are installed automatically when the keys are saved —
you do not need to configure them manually in Stripe.
:::

After the keys are saved, make sure the storefront's `NEXT_PUBLIC_PAYMENT_APP_ID`,
`NEXT_PUBLIC_STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY` are set (see
[Configure the Nimara Storefront](#configure-the-nimara-storefront)) and restart it.

:::note
For detailed setup instructions, see the official docs:
[Nimara TypeScript Stripe App documentation](https://github.com/mirumee/nimara-ecommerce/blob/main/apps/stripe/README.md)
:::
