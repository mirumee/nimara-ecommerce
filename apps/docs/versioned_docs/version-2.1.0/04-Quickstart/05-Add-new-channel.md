---
id: add-new-channel
title: Add New Channel
---

# Adding a new locale, language, and market in Nimara

Nimara storefront currently supports two locales: **en-US** (United States) and **en-GB** (Great Britain). This guide walks you through adding a new locale, language, and market (for example, Spanish/Spain) to your Nimara storefront.

## Architecture Overview

Nimara's i18n system is organized across two main layers:

- **`@nimara/i18n` package:** Shared i18n configuration, routing, and message loading (locales, locale prefixes, message paths)
- **`apps/storefront/src/foundation/regions`:** Storefront-specific market/region configuration (channels, languages, currencies, markets)

This separation allows flexibility: you can have multiple locales mapped to the same market, or create region-specific configurations independent of i18n.

### Create a new sales channel in Saleor

Go to your Saleor dashboard → **Configuration** → **Channels** → click **Create Channel**.

Enter the channel details:

- **Name:** e.g., "Spain Channel"
- **Slug:** e.g., "channel-es" (used in storefront configuration)
- **Default country:** Spain
- **Shipping zones:** Assign appropriate zones (e.g., "Europe" for Spain)

After creating the channel, assign the products you want to offer in this channel.

### Add the locale to the shared i18n config

The i18n package (`packages/i18n/src/config.ts`) centralizes locale configuration that applies across the storefront.

Edit `packages/i18n/src/config.ts`:

```ts title="packages/i18n/src/config.ts"
/**
 * List of supported locales.
 * Format: BCP 47 / IETF language tag (e.g. "en-US", "es-ES")
 * Combines ISO 639-1 language code with ISO 3166-1 region code.
 */
export const LOCALES = ["en-US", "en-GB", "es-ES"] as const;

/**
 * Map of locales to their display names.
 */
export const LOCALE_LABELS = {
  "en-US": "English (United States)",
  "en-GB": "English (United Kingdom)",
  "es-ES": "Español (España)",
} as const satisfies Record<SupportedLocale, string>;

/**
 * Map of locales to their message files.
 * Each locale must have a corresponding JSON file in src/messages/
 */
export const MESSAGES_PATH_MAP = {
  "en-US": "@nimara/i18n/messages/en-US.json",
  "en-GB": "@nimara/i18n/messages/en-GB.json",
  "es-ES": "@nimara/i18n/messages/es-ES.json",
} as const satisfies Record<SupportedLocale, string>;

/**
 * Map of non-default locales to their URL prefixes.
 * Default locale ("en-US") does not need a prefix.
 */
export const LOCALE_PREFIXES = {
  "en-GB": "/gb",
  "es-ES": "/es",
} as const satisfies Record<
  Exclude<SupportedLocale, typeof DEFAULT_LOCALE>,
  `/${string}`
>;
```

:::note
`LOCALE_LABELS` and `MESSAGES_PATH_MAP` exist to satisfy the `Record<SupportedLocale, string>` type — adding your locale to them keeps the type checker happy, but they are **not** what loads translations at runtime. The actual message loading happens in `packages/i18n/src/loadMessages.ts` (see [Register the locale's messages in the loader](#register-the-locales-messages-in-the-loader) below). `LOCALES`, `LOCALE_PREFIXES`, and `DEFAULT_LOCALE` are the config values that routing and middleware read.
:::

### Add translations for the new locale

Translations live in **per-locale directories** under `packages/i18n/src/messages/`, each split into three files:

- `common.json` — messages shared across all apps
- `storefront.json` — storefront-only messages
- `marketplace.json` — marketplace-only messages

Create a directory for the new locale and add the three files (seed them from the base locale, then translate):

```bash
mkdir -p packages/i18n/src/messages/es-ES
cp packages/i18n/src/messages/en/common.json packages/i18n/src/messages/es-ES/common.json
cp packages/i18n/src/messages/en/storefront.json packages/i18n/src/messages/es-ES/storefront.json
cp packages/i18n/src/messages/en/marketplace.json packages/i18n/src/messages/es-ES/marketplace.json
```

Each file mirrors the base structure — top-level namespaces with translation keys. For example, `common.json`:

```json title="packages/i18n/src/messages/es-ES/common.json"
{
  "checkout-errors": {
    "INSUFFICIENT_STOCK": "El producto no tiene stock suficiente."
  },
  "filters": {
    "color": "Color"
  }
}
```

### Register the locale's messages in the loader

`packages/i18n/src/loadMessages.ts` wires the message files up with **static imports** — this is what actually loads translations at runtime. Add imports for the new locale and register them in `LOCALE_SHARED` (the `common.json`) and `LOCALE_APP` (the per-app files):

```ts title="packages/i18n/src/loadMessages.ts"
// ...existing imports
import esSharedCommon from "./messages/es-ES/common.json";
import esMarketplace from "./messages/es-ES/marketplace.json";
import esStorefront from "./messages/es-ES/storefront.json";

const LOCALE_SHARED: Partial<Record<SupportedLocale, AnyMessages>> = {
  "en-GB": enGbSharedCommon as AnyMessages,
  "es-ES": esSharedCommon as AnyMessages,
};

const LOCALE_APP: Partial<
  Record<SupportedLocale, Partial<Record<AppId, AnyMessages>>>
> = {
  "en-GB": {
    storefront: enGbStorefront as AnyMessages,
    marketplace: enGbMarketplace as AnyMessages,
  },
  "es-ES": {
    storefront: esStorefront as AnyMessages,
    marketplace: esMarketplace as AnyMessages,
  },
};
```

### Configure the market/region in the storefront

Storefront-specific market configuration lives in `apps/storefront/src/foundation/regions/config.ts`.

This maps the locale to a Saleor channel, defines language metadata, and market-specific details.

Edit `apps/storefront/src/foundation/regions/config.ts`:

```ts title="apps/storefront/src/foundation/regions/config.ts"
import { LOCALES } from "@nimara/i18n/config";

import { clientEnvs } from "@/envs/client";

export const CHANNEL = clientEnvs.NEXT_PUBLIC_DEFAULT_CHANNEL;

export const LOCALE_CHANNEL_MAP = {
  "en-GB": "gb",
  "en-US": "us",
  "es-ES": "es", // Map the locale to the market ID
} as const;

export const SUPPORTED_CURRENCIES = ["USD", "GBP", "EUR"] as const;

export const SUPPORTED_CHANNELS = [
  "default-channel",
  "channel-us",
  "channel-uk",
  "channel-es",
] as const;

// Keep this list in sync when a market uses a continent not already listed.
// Spain is in Europe, which is already present, so no change is needed here.
export const SUPPORTED_CONTINENTS = [
  "Asia Pacific",
  "Europe",
  "North America",
] as const;

export const LANGUAGES = {
  GB: {
    id: "gb",
    name: "English (United Kingdom)",
    code: "EN_GB",
    locale: "en-GB",
  },
  US: {
    id: "us",
    name: "English (United States)",
    code: "EN_US",
    locale: "en-US",
  },
  ES: {
    id: "es",
    name: "Español (España)",
    code: "ES_ES",
    locale: "es-ES",
  },
} as const;

export const MARKETS = {
  GB: {
    id: "gb",
    name: "United Kingdom",
    channel: "channel-uk",
    currency: "GBP",
    continent: "Europe",
    countryCode: "GB",
    defaultLanguage: LANGUAGES.GB,
    supportedLanguages: [LANGUAGES.GB],
  },
  US: {
    id: "us",
    name: "United States of America",
    channel: "channel-us",
    currency: "USD",
    continent: "North America",
    countryCode: "US",
    defaultLanguage: LANGUAGES.US,
    supportedLanguages: [LANGUAGES.US],
  },
  ES: {
    id: "es",
    name: "España",
    channel: "channel-es",
    currency: "EUR",
    continent: "Europe",
    countryCode: "ES",
    defaultLanguage: LANGUAGES.ES,
    supportedLanguages: [LANGUAGES.ES],
  },
} as const;

export const REGIONS_CONFIG = {
  channel: CHANNEL,
  supportedLocales: LOCALES,
  languages: LANGUAGES,
  markets: MARKETS,
  localeToMarket: LOCALE_CHANNEL_MAP,
  supportedCurrencies: SUPPORTED_CURRENCIES,
} as const;
```

When the storefront loads, it uses the current locale's channel map to fetch products and configurations for that market.

### Test the new locale

Start the dev server and test the new locale:

```bash
pnpm run dev:storefront
```

Visit:

- `http://localhost:3000` - Default locale (en-US)
- `http://localhost:3000/gb` - United Kingdom (en-GB)
- `http://localhost:3000/es` - Spain (es-ES)

Verify:

- Correct locale is displayed in headers/footers
- Products are from the correct Saleor channel
- Prices are in the correct currency
- Checkout works with the correct market configuration

## Key Concepts

**Locale:** A BCP 47 language tag combining language and region (e.g., "es-ES" = Spanish in Spain).

**Market:** Storefront-specific configuration including channel, currency, language metadata, and region details.

**Channel:** A Saleor sales channel that groups products, pricing, and regional configuration.

**Locale Prefix:** URL path segment for non-default locales (e.g., `/es` for "es-ES").

**LOCALE_CHANNEL_MAP:** Maps each locale to a storefront market ID for routing and configuration.

## Summary

Adding a new locale involves:

1. Create channel in Saleor
2. Add locale to `@nimara/i18n/config.ts` (`LOCALES`, `LOCALE_LABELS`, `MESSAGES_PATH_MAP`, `LOCALE_PREFIXES`)
3. Create translation files in the locale directory: `packages/i18n/src/messages/es-ES/{common,storefront,marketplace}.json`
4. Register the messages in `packages/i18n/src/loadMessages.ts` (`LOCALE_SHARED`, `LOCALE_APP`)
5. Map locale to market in storefront: `apps/storefront/src/foundation/regions/config.ts`
6. Test across all locales

This modular approach keeps Nimara scalable and international-ready.
