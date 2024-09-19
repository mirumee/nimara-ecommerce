import type {
  Language,
  LanguageId,
  Locale,
  Market,
  MarketId,
  SUPPORTED_MARKETS,
} from "@/regions/types";

export const LOCALE_CHANNEL_MAP: Record<
  Locale,
  (typeof SUPPORTED_MARKETS)[number]
> = {
  "en-GB": "gb",
  "en-US": "us",
};

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
} satisfies Record<Uppercase<LanguageId>, Language>;

export const MARKETS = {
  GB: {
    id: "gb",
    name: "United Kingdom",
    channel: "channel-uk",
    currency: "GBP",
    countryCode: "GB",
    defaultLanguage: LANGUAGES.GB,
    supportedLanguages: [LANGUAGES.GB],
  },
  US: {
    id: "us",
    name: "United States of America",
    channel: "channel-us",
    currency: "USD",
    countryCode: "US",
    defaultLanguage: LANGUAGES.US,
    supportedLanguages: [LANGUAGES.US],
  },
} satisfies Record<Uppercase<MarketId>, Market>;
