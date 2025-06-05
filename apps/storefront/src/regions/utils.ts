import { LANGUAGES, LOCALE_CHANNEL_MAP, MARKETS } from "./config";
import {
  type LanguageId,
  type MarketId,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "./types";

function getMarketId(locale: SupportedLocale): MarketId {
  return LOCALE_CHANNEL_MAP[locale];
}

export function getLanguageId(locale: SupportedLocale): LanguageId {
  return LOCALE_CHANNEL_MAP[locale];
}

export const parseRegion = (locale: string) => {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Locale ${locale} is not supported`);
  }

  const marketId = getMarketId(locale);
  const languageId = getLanguageId(locale);

  return Object.freeze({
    market: MARKETS[marketId.toUpperCase() as Uppercase<MarketId>],
    language: LANGUAGES[languageId.toUpperCase() as Uppercase<LanguageId>],
  });
};
