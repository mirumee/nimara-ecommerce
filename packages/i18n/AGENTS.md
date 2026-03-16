# AGENTS.md

## Adding a new language to the storefront

- Add a new language to `SUPPORTED_LOCALES` array in `src/config.ts`
- Add the locale name to `LOCALE_NAME_MAP` in `src/config.ts`
- Add base English strings under `src/messages/en/` (split by feature, e.g. `storefront.json`, `marketplace.json`, `common.json`)
- Add locale-specific override files under `src/messages/<locale>/` mirroring the feature files, but only including keys that differ from base English
- After changing the default locale, adjust the `global.d.ts` import

## Message structure

- Base English copy is defined in the feature-based files under `src/messages/en/`
  - `storefront.json` – storefront-specific namespaces (e.g. `home`, `cart`, `checkout`, `auth`, `account`, `order`, `site`, `products`, `collections`, etc.)
  - `marketplace.json` – marketplace-specific namespaces (e.g. `marketplace`, vendor orders, collections, drafts, customers, shared, etc.)
  - `common.json` – shared namespaces used across apps (e.g. `common`, `errors`, `form-validation`, `stock-errors`)
- Regional locales (e.g. `en-US`, `en-GB`) live under `src/messages/<locale>/`
  - Each file (e.g. `src/messages/en-GB/storefront.json`) contains **only overrides** for keys that differ from the base English messages
  - If an override file or key is missing, the base English value from `src/messages/en/` is used

## Loading logic

- Apps do **not** import JSON files directly
- Instead, they use `createRequestConfig` from `@nimara/i18n/request`, which internally calls `loadMessages(locale, app)`
  - Storefront passes `app: "storefront"`
  - Marketplace passes `app: "marketplace"`
- `loadMessages` composes the final messages object as:
  - `en/common.json` → base shared
  - `en/<app>.json` → base for the given app
  - `messages/<locale>/common.json` → locale shared overrides
  - `messages/<locale>/<app>.json` → locale app overrides
- The resulting object preserves the full key paths from the original monolithic files (e.g. `home.title`, `marketplace.configuration.general.heading`)
