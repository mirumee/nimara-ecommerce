import { getLocale } from "next-intl/server";

import type {
    ChannelId,
    Language,
    LanguageId,
    LanguageOf,
    Market,
    MarketId,
    MarketOf,
    RegionOf,
    SupportedCurrency,
    SupportedLocale,
} from "./types";

export type RegionsConfig = {
    channel: ChannelId;
    languages: Readonly<Record<Uppercase<LanguageId>, Language>>;
    localeToMarket: Readonly<Record<SupportedLocale, MarketId>>;
    markets: Readonly<Record<Uppercase<MarketId>, Market>>;
    supportedCurrencies: readonly SupportedCurrency[];
    supportedLocales: readonly SupportedLocale[];
};

function getMarketId(locale: SupportedLocale, cfg: RegionsConfig): MarketId {
    return cfg.localeToMarket[locale];
}

function getLanguageId(locale: SupportedLocale, cfg: RegionsConfig): LanguageId {
    return cfg.localeToMarket[locale];
}

export function createRegions<const C extends RegionsConfig>(config: C) {
    const parseRegion = (locale: string): Readonly<RegionOf<C>> => {
        if (!config.supportedLocales.includes(locale)) {
            throw new Error(`Locale ${String(locale)} is not supported`);
        }

        const normalized = locale;

        const marketId = getMarketId(normalized, config);
        const languageId = getLanguageId(normalized, config);

        const baseMarket = config.markets[
            marketId.toUpperCase() as Uppercase<MarketId>
        ] as MarketOf<C>;
        const language = config.languages[
            languageId.toUpperCase() as Uppercase<LanguageId>
        ] as LanguageOf<C>;

        const channel: ChannelId =
            marketId === "us" && config.channel === "default-channel"
                ? "default-channel"
                : (baseMarket as { channel: ChannelId }).channel;

        const market = {
            ...baseMarket,
            channel,
        } as const;

        return {
            market,
            language,
            locale,
        } as const;
    };

    const getCurrentRegion = async (): Promise<Readonly<RegionOf<C>>> => {
        const locale = await getLocale();


        return Object.freeze(parseRegion(locale));
    };

    return {
        getCurrentRegion,
        parseRegion,
    } as const;
}


