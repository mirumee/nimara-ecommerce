/**
 * List of supported locales in the storefront.
 * The locales must be in BCP 47 / IETF language tag format (e.g. "en-US", "en-GB" or "es-ES").
 * This format combines ISO 639-1 language code with ISO 3166-1 region code.
 * Adjust this array to your business needs.
 * @see https://en.wikipedia.org/wiki/ISO_639-1
 * @see https://en.wikipedia.org/wiki/ISO_3166-1
 */
export const SUPPORTED_LOCALES = ["en-US", "en-GB"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Default locale.
 * Must be one of the locales in the `SUPPORTED_LOCALES` array.
 * A locale includes both language and region information (e.g., "en-US" = English in United States).
 */
export const DEFAULT_LOCALE = "en-US" as const satisfies SupportedLocale;
export type DefaultLocale = typeof DEFAULT_LOCALE;

/**
 * Map of the supported locales to their names.
 * Must be in-sync with the `SUPPORTED_LOCALES` array.
 */
export const LOCALE_LABELS = {
  "en-US": "English (United States)",
  "en-GB": "English (United Kingdom)",
} as const satisfies Record<SupportedLocale, string>;
export type LocaleLabels = typeof LOCALE_LABELS;

/**
 * Map of the supported locales to their messages path.
 * Must be in-sync with the `SUPPORTED_LOCALES` array.
 */
export const MESSAGES_PATH_MAP = {
  "en-US": "@nimara/i18n/messages/en-US.json",
  "en-GB": "@nimara/i18n/messages/en-GB.json",
} as const satisfies Record<SupportedLocale, string>;
export type MessagesPathMap = typeof MESSAGES_PATH_MAP;

/**
 * Map of the supported locales to their locale prefixes.
 * Must be in-sync with the `SUPPORTED_LOCALES` array.
 */
export const LOCALE_PREFIXES = {
  "en-GB": "/gb",
} as const satisfies Record<
  Exclude<SupportedLocale, typeof DEFAULT_LOCALE>,
  `/${string}`
>;
export type LocalePrefixes = typeof LOCALE_PREFIXES;
