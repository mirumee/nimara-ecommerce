import { SUPPORTED_LOCALES } from "@nimara/i18n/config";

import { clientEnvs } from "@/envs/client";

export const CHANNEL = clientEnvs.NEXT_PUBLIC_DEFAULT_CHANNEL;

export const LOCALE_CHANNEL_MAP = {
  "en-GB": "gb",
  "en-US": "us",
} as const;

export const SUPPORTED_CURRENCIES = ["USD", "GBP"] as const;

export const SUPPORTED_CHANNELS = [
  "default-channel",
  "channel-us",
  "channel-uk",
] as const;

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
} as const;

export const REGIONS_CONFIG = {
  channel: CHANNEL,
  supportedLocales: SUPPORTED_LOCALES,
  languages: LANGUAGES,
  markets: MARKETS,
  localeToMarket: LOCALE_CHANNEL_MAP,
  supportedCurrencies: SUPPORTED_CURRENCIES,
} as const;
