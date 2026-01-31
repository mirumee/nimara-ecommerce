# AGENTS.md

## Adding a new language to the storefront

- Add a new language to `SUPPORTED_LOCALES` array in `src/config.ts`
- Add the locale name to `LOCALE_NAME_MAP` in `src/config.ts`
- Add a new JSON file with translated messages in `src/messages`
- After changing the default locale, adjust the `global.d.ts` import
