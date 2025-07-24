import { clientEnvs } from "@/envs/client";
import type {
  Language,
  LanguageId,
  Market,
  MarketId,
  SUPPORTED_MARKETS,
  SupportedLocale,
} from "@/regions/types";

export const CHANNEL = clientEnvs.NEXT_PUBLIC_DEFAULT_CHANNEL;

export const LOCALE_CHANNEL_MAP: Record<
  SupportedLocale,
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
} satisfies Record<Uppercase<MarketId>, Market>;
