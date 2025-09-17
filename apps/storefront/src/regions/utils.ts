import { CHANNEL, LANGUAGES, LOCALE_CHANNEL_MAP, MARKETS } from "./config";
import {
  type ChannelId,
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

  const baseMarket = MARKETS[marketId.toUpperCase() as Uppercase<MarketId>];
  const language = LANGUAGES[languageId.toUpperCase() as Uppercase<LanguageId>];

  // For US market, override channel to "default-channel" if env says so (for fresh Saleor setups).
  const channel: ChannelId =
    marketId === "us" && CHANNEL === "default-channel"
      ? "default-channel"
      : baseMarket.channel;

  const market = {
    ...baseMarket,
    channel,
  };

  return Object.freeze({
    market,
    language,
  });
};
