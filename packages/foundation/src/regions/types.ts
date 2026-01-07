import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { type AllCountryCode } from "@nimara/domain/consts";

export type LanguageId = string;
export type MarketId = string;
export type ChannelId = string;
export type SupportedLocale = string;
export type SupportedCurrency = string;
export type Continent = string;

export type Language = {
    code: LanguageCodeEnum;
    id: LanguageId;
    locale: SupportedLocale;
    name: string;
};

export type Market = {
    channel: ChannelId;
    continent: Continent;
    countryCode: AllCountryCode;
    currency: SupportedCurrency;
    defaultLanguage: Language;
    id: MarketId;
    name: string;
    supportedLanguages: readonly Language[];
};

export type Region = {
    language: Language;
    locale: SupportedLocale;
    market: Market;
};

// Helper generic types to derive literal unions from a given config object
export type SupportedLocaleOf<C extends { supportedLocales: readonly string[] }> = C["supportedLocales"][number];
export type MarketIdOf<C extends { markets: Readonly<Record<string, unknown>> }> = Lowercase<keyof C["markets"] & string>;
export type LanguageIdOf<C extends { languages: Readonly<Record<string, unknown>> }> = Lowercase<keyof C["languages"] & string>;
export type SupportedCurrencyOf<C extends { supportedCurrencies: readonly string[] }> = C["supportedCurrencies"][number];
// export type ChannelIdOf<C extends { supportedChannels: readonly string[] }> = C["supportedChannels"][number];
// export type ContinentOf<C extends { supportedContinents: readonly string[] }> = C["supportedContinents"][number];

export type LanguageOf<C extends { languages: Readonly<Record<string, unknown>> }> = C["languages"][keyof C["languages"]];
export type MarketOf<C extends { markets: Readonly<Record<string, unknown>> }> = C["markets"][keyof C["markets"]];
export type RegionOf<C extends {
    languages: Readonly<Record<string, unknown>>;
    markets: Readonly<Record<string, unknown>>;
    supportedLocales: readonly string[];
}> = {
    language: C["languages"][keyof C["languages"]];
    locale: C["supportedLocales"][number];
    market: C["markets"][keyof C["markets"]];
};


