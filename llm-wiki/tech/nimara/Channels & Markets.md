---
type: "Technical Reference"
title: "Channels & Markets"
description: "Adding a new locale, language, and market to the Nimara storefront — the split between the shared @nimara/i18n config and the storefront's regions config, mapped onto Saleor channels."
tags:
  - "nimara"
  - "channels"
  - "markets"
  - "locale"
  - "reference"
resource: "/sources/nimara-docs/add-new-channel.mdx"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/add-new-channel.mdx) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

How to add a new locale, language, and market (source: [add-new-channel](/sources/nimara-docs/add-new-channel.mdx)). The storefront ships with **en-US** and **en-GB**; the walkthrough uses Spanish/Spain (`es-ES`) as the worked example.

### Two configuration layers
- **`@nimara/i18n` package** — shared i18n config, routing, and message loading (locales, locale prefixes, message paths).
- **`apps/storefront/src/foundation/regions`** — storefront-specific market/region config (channels, languages, currencies, markets).

This split lets multiple locales map to the same market, or region-specific config to exist independently of i18n.

### Steps
1. **Create a Saleor sales channel** — Saleor dashboard → Configuration → Channels → Create Channel (name, slug e.g. `channel-es`, default country, shipping zones). Assign the products offered in that channel. See the Saleor [Channels](/tech/saleor/Channels.md) note.
2. **Add the locale to `packages/i18n/src/config.ts`** — extend `LOCALES` (BCP 47 tags), `LOCALE_LABELS`, `MESSAGES_PATH_MAP`, and `LOCALE_PREFIXES` (the default locale needs no prefix).
3. **Add translations** — copy an existing locale file (`cp packages/i18n/src/messages/en-GB.json …/es-ES.json`) and translate it, mirroring the existing structure.
4. **Configure the market in `apps/storefront/src/foundation/regions/config.ts`** — map the locale to a channel via `LOCALE_CHANNEL_MAP`, and extend `SUPPORTED_CURRENCIES`, `SUPPORTED_CHANNELS`, `LANGUAGES`, and `MARKETS` (each market carries `channel`, `currency`, `countryCode`, default/supported languages). `REGIONS_CONFIG` composes these.
5. **Set the env var** — `NEXT_PUBLIC_DEFAULT_CHANNEL` should match a Saleor channel slug. See [Environment Variables](/tech/nimara/Environment%20Variables.md).
6. **Test** — `pnpm run dev:storefront`, then visit the default locale and each prefixed locale (e.g. `/gb`, `/es`); verify locale display, correct channel's products, currency, and checkout.

### Key concepts
- **Locale** — a BCP 47 tag combining language + region (`es-ES`).
- **Market** — storefront config: channel, currency, language metadata, region details.
- **Channel** — a Saleor sales channel grouping products, pricing, and regional config.
- **Locale prefix** — URL segment for non-default locales (`/es`).
- **`LOCALE_CHANNEL_MAP`** — maps each locale to a storefront market ID for routing/config.

For message composition mechanics, see [Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Internationalization (i18n)](/tech/nimara/Internationalization%20%28i18n%29.md)
[Environment Variables](/tech/nimara/Environment%20Variables.md)
[Channels](/tech/saleor/Channels.md)
