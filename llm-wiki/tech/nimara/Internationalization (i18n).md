---
type: "Technical Reference"
title: "Internationalization (i18n)"
description: "Nimara's shared @nimara/i18n package: feature-based message files, locale overrides, and how each app composes its final messages object via createRequestConfig."
tags:
  - "nimara"
  - "i18n"
  - "localization"
  - "reference"
resource: "/sources/nimara-docs/i18n.md"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/i18n.md) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Nimara uses a shared i18n package with **feature-based message files** and **locale overrides**, consumed by all apps (storefront, marketplace, stripe, …) (source: [i18n](/sources/nimara-docs/i18n.md)).

### Files and namespaces
Base English messages live under `packages/i18n/src/messages/en/`:

- `common.json` — shared namespaces (`common`, `errors`, `form-validation`, `stock-errors`, …).
- `storefront.json` — storefront namespaces (`home`, `cart`, `checkout`, `auth`, `account`, `order`, …).
- `marketplace.json` — marketplace namespaces (`marketplace.*`: vendor products, orders, collections, …).

Regional overrides live under `packages/i18n/src/messages/<locale>/` (e.g. `en-GB`) and contain **only** the keys that differ from base English. This keeps keys stable across locales (e.g. `home.title`, `marketplace.configuration.general.heading`) while letting regions override wording.

### How a messages object is composed
Each app passes an `app` identifier into `@nimara/i18n`'s `createRequestConfig`, which calls `loadMessages(locale, app)`. The merge order is:

1. `en/common.json` + `en/<app>.json` (base common + app).
2. apply `<locale>/common.json` shared overrides (optional).
3. apply `<locale>/<app>.json` app overrides (optional) → final messages for the locale.

The storefront passes `app: "storefront"` (uses `en/storefront.json`); the marketplace passes `app: "marketplace"` (uses `en/marketplace.json`).

### Adding another app to the mechanism
1. Add an `<app>.json` base file under `packages/i18n/src/messages/en/`.
2. Optionally add `<locale>/<app>.json` override files where wording differs.
3. Pass `app: "<app>"` into `createRequestConfig` in the app's i18n bootstrap.

Adding a new **locale/market** (not just an app) is a broader change — see [Channels & Markets](/tech/nimara/Channels%20%26%20Markets.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Channels & Markets](/tech/nimara/Channels%20%26%20Markets.md)
[Storefront](/tech/nimara/Storefront.md)
[Marketplace](/tech/nimara/Marketplace.md)
[Translations](/tech/saleor/Translations.md)
