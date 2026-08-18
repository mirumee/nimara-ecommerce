---
id: environment-variables
title: Environment Variables
---

# Environment Variables

This page lists and explains all environment variables used by the Nimara storefront. Use this to correctly set up your `.env` file.

**Zero-config:** every variable below is optional. With an empty `.env` the storefront boots and renders every page with empty data (no menu, no products, checkout hidden). Set variables only to connect real services. Copy `apps/storefront/.env.example` to `.env` and fill in what you need, then run `pnpm preflight --report` to see which features are currently on/off.

---

## Core

#### `NEXT_PUBLIC_ENVIRONMENT`

- **Description**: Environment type for error reporting, logging, and demo-data fallbacks.
- **Options**: `TEST`, `LOCAL`, `DEVELOPMENT`, `STAGING`, `PRODUCTION`
- **Default**: `LOCAL`

#### `NEXT_PUBLIC_DEFAULT_CHANNEL`

- **Description**: A Saleor channel slug used for catalog and pricing on the storefront.
- **How to get it**: Saleor dashboard → **Configuration** → **Channels** → copy the slug of the channel to be used as the default.
- **Default**: `default-channel`

#### `NEXT_PUBLIC_DEFAULT_EMAIL`

- **Description**: Contact email shown in the UI.
- **Default**: `contact@mirumee.com`

#### `NEXT_PUBLIC_DEFAULT_PAGE_TITLE`

- **Description**: Default page title used in metadata.
- **Default**: `Nimara Storefront`

#### `NEXT_PUBLIC_STOREFRONT_URL`

- **Description**: Public URL of your storefront, used for generating absolute URLs in sitemap.xml, OpenGraph, etc.
- **Default**: The Vercel branch URL, or `localhost:3000`.
- **Example**: `https://my-new-store.com`

#### `NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT`

- **Description**: Preferred image format served from Saleor.
- **Options**: `AVIF`, `WEBP`, `ORIGINAL`
- **Default**: `AVIF`

---

## Backend (Saleor)

#### `NEXT_PUBLIC_SALEOR_API_URL`

- **Description**: URL of the Saleor GraphQL API endpoint. When unset, the storefront runs in zero-config empty mode (no products, no menu).
- **How to get it**: Saleor Cloud → **Projects** → select the relevant project → **Environment Details**.
- **Note**: Must end with a trailing slash `/graphql/`.
- **Example**: `https://your-domain.saleor.cloud/graphql/`

#### `SALEOR_APP_TOKEN`

- **Description**: Saleor app token (server-only). Needed for authenticated reads, e.g. loading unpublished CMS/vendor pages. Leave empty for anonymous, published content only.
- **How to get it**: Saleor dashboard → **Extensions** → click **Add extension** → select **Provide details manually** → add name and assign the necessary permissions for your app: **Handle checkouts** and **Manage Customers** → click **Save**.

---

## Integrations (provider selection)

Each capability (search, CMS, newsletter) is served by one swappable provider, chosen at build time and read server-side only. When Saleor is not configured, search and CMS fall back to the built-in `dummy` provider (sample data) so a fresh clone is populated out of the box — except when `NEXT_PUBLIC_ENVIRONMENT=PRODUCTION`, where they stay empty so demo data never leaks to a live deployment.

Newsletter is the exception to the fallback above: it has **no default provider**. Nimara cannot pick an email service provider on your behalf, so an unset `NEWSLETTER_SERVICE` means the capability is off and the home-page newsletter form is absent.

Per-provider config is namespaced (`SEARCH_<PROVIDER>_*` / `CMS_<PROVIDER>_*` / `NEWSLETTER_<PROVIDER>_*`) and validated only when that provider is selected — set only the variables for the provider you picked.

### Search

#### `SEARCH_SERVICE`

- **Description**: Search provider used by the storefront (server-side only).
- **Options**: `saleor`, `algolia`, `dummy`
- **Default**: `saleor`

#### `SEARCH_ALGOLIA_APP_ID`

- **Description**: Algolia application ID. Required if `SEARCH_SERVICE` is set to `algolia`.
- **How to get it**: Algolia dashboard → **API Keys** → copy the `Application ID`.
- **Example**: `your-algolia-app-id`

#### `SEARCH_ALGOLIA_API_KEY`

- **Description**: Algolia search API key. Required if `SEARCH_SERVICE` is set to `algolia`.
- **How to get it**: Algolia dashboard → **API Keys** → copy the `Search API key`.
- **Example**: `your-algolia-search-api-key`

#### `SEARCH_ALGOLIA_INDICES`

- **Description**: JSON array of index settings (channel, currency, `indexName`, available facets, virtual replicas). Required if `SEARCH_SERVICE` is set to `algolia`; at least one index must be configured.
- **Example**: `[{"channel":"default-channel","currency":"USD","indexName":"products","availableFacets":{},"virtualReplicas":[]}]`

### CMS

#### `CMS_SERVICE`

- **Description**: CMS provider for pages and menus (server-side only).
- **Options**: `saleor`, `butter-cms`, `dummy`
- **Default**: `saleor`

#### `CMS_BUTTER_TOKEN`

- **Description**: ButterCMS read token. Required if `CMS_SERVICE` is set to `butter-cms`.
- **How to get it**: ButterCMS dashboard → **Settings** → **API Tokens**.

### Newsletter

See [Newsletter Integration](../Integrations/newsletter-integration) for the
provider-side setup these variables depend on.

#### `NEWSLETTER_SERVICE`

- **Description**: Email service provider that receives newsletter subscriptions (server-side only). Unset means the capability is off and the newsletter form is not rendered.
- **Options**: `brevo`, `dummy`
- **Default**: none — the capability is off until you set this.

#### `NEWSLETTER_BREVO_API_KEY`

- **Description**: Brevo API key. Required if `NEWSLETTER_SERVICE` is set to `brevo`.
- **How to get it**: Brevo dashboard → **SMTP & API** → **API Keys** → **Generate a new API key**.
- **Example**: `xkeysib-...`

#### `NEWSLETTER_BREVO_LIST_IDS`

- **Description**: Comma-separated Brevo list ids the contact joins after confirming. Required if `NEWSLETTER_SERVICE` is set to `brevo`.
- **How to get it**: Brevo dashboard → **Contacts** → **Lists** → the id shown next to each list.
- **Example**: `4,9`

#### `NEWSLETTER_BREVO_DOI_TEMPLATE_ID`

- **Description**: Id of the Brevo double-opt-in email template, or a JSON map of locale to template id containing a `default` key. Required if `NEWSLETTER_SERVICE` is set to `brevo`.
- **How to get it**: Brevo dashboard → **Campaigns** → **Templates** → open the double-opt-in template and copy its id. The template must be active, carry the tag `optin`, and place its confirmation link on the `{{ params.DOIurl }}` tag — see the integration guide, because Brevo enforces none of the three at creation time.
- **Example**: `12` or `{"default":12,"en-GB":15}`

#### `NEWSLETTER_BREVO_REDIRECT_URL`

- **Description**: Absolute URL the shopper lands on after confirming. Required if `NEWSLETTER_SERVICE` is set to `brevo`. Nimara ships no confirmation page — point this at one your deployment owns.
- **Example**: `https://my-store.com/newsletter/confirmed`

#### `NEWSLETTER_BREVO_TIMEOUT_MS`

- **Description**: Budget for the outbound Brevo call. A request that exceeds it is abandoned and never retried, because Brevo may already have accepted it and sent the confirmation email.
- **Default**: `3000`

---

## Auth

#### `AUTH_SECRET`

- **Description**: Secret for session encryption (used by Auth.js). Required for customer login.
- **How to get it**: Generate a random secure string, e.g. `openssl rand -base64 32`.

#### `AUTH_URL`

- **Description**: Auth.js base URL for callback handling.
- **Notes**: Required when **not** deploying on Vercel.
- **Example**: `https://my-new-store.com`

---

## Payments (Stripe)

See the [Nimara Stripe integration section](../Integrations/stripe-integration) for detailed instructions on setting it up.

#### `NEXT_PUBLIC_PAYMENT_APP_ID`

- **Description**: Identifier of the Saleor payment app used at checkout. The app reports its
  own publishable key per channel, so the storefront holds no Stripe key.

---

## Marketplace

#### `NEXT_PUBLIC_MARKETPLACE_ENABLED`

- **Description**: Enable multi-vendor behavior in the storefront (e.g. cart limited to a single vendor, marketplace-specific UI).
- **Options**: `true`, `false`
- **Default**: `false`

#### `NEXT_PUBLIC_MARKETPLACE_VENDOR_URL`

- **Description**: Public URL of the marketplace vendor portal, used for footer links. When empty, the marketplace footer column is hidden.
- **Example**: `http://localhost:3001`

---

## Monitoring (Sentry)

Sentry is only enabled when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are set.

#### `SENTRY_DSN`

- **Description**: Sentry project DSN. `NEXT_PUBLIC_SENTRY_DSN` is also supported and takes precedence when both are set.

#### `SENTRY_AUTH_TOKEN`

- **Description**: Auth token for uploading source maps.

#### `SENTRY_ORG`

- **Description**: Your Sentry organization name.

#### `SENTRY_PROJECT`

- **Description**: Your Sentry project name.

#### `SENTRY_DEBUG`

- **Description**: Enable Sentry debug logging (set to `true` or `false`).

---

## Analytics (Google Tag Manager)

#### `NEXT_PUBLIC_GTM_ID`

- **Description**: Google Tag Manager container ID. GTM loads only when this is set. Google Consent Mode v2 gates `analytics_storage` on the cookie-banner choice; ad signals stay denied.
- **Example**: `GTM-XXXXXXX`

#### `NEXT_PUBLIC_GTM_AUTH`, `NEXT_PUBLIC_GTM_PREVIEW`

- **Description**: Optional GTM environment parameters for preview/staging containers. Set both together.

---

## Logging

#### `LOG_LEVEL`

- **Description**: Logging level for application output. Read directly (not part of the validated env schema) and shared across apps.
- **Options**: `debug`, `info`, `warn`, `error`, `critical`
- **Default**: `debug`

---

## E2E Testing (Playwright)

These variables configure the `apps/automated-tests` Playwright suite, not the storefront itself.

#### `TEST_ENV_URL`

- **Description**: URL used for end-to-end tests.
- **Example**: `https://localhost:3000`

#### `USER_EMAIL`, `USER_PASSWORD`

- **Description**: Credentials for testing login during E2E tests.
