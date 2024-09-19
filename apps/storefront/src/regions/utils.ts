import { LANGUAGES, LOCALE_CHANNEL_MAP, MARKETS } from "./config";
import {
  type LanguageId,
  type Locale,
  type MarketId,
  SUPPORTED_LOCALES,
} from "./types";

function getMarketId(locale: Locale): MarketId {
  return LOCALE_CHANNEL_MAP[locale];
}

export function getLanguageId(locale: Locale): LanguageId {
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
