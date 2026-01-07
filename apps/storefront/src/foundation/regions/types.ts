import { type LanguageIdOf, type MarketIdOf, type MarketOf, type RegionOf, type SupportedCurrencyOf, type SupportedLocaleOf } from "@nimara/foundation/regions/types";

import { type REGIONS_CONFIG } from "./config";

// App-wide derived union types from configuration
export type SupportedLocale = SupportedLocaleOf<typeof REGIONS_CONFIG>;
export type MarketId = MarketIdOf<typeof REGIONS_CONFIG>;
export type LanguageId = LanguageIdOf<typeof REGIONS_CONFIG>;
export type Region = Readonly<RegionOf<typeof REGIONS_CONFIG>>;
export type Market = MarketOf<typeof REGIONS_CONFIG>;
export type SupportedCurrency = SupportedCurrencyOf<typeof REGIONS_CONFIG>;
// export type ChannelId = ChannelIdOf<typeof REGIONS_CONFIG>;
// export type Continent = ContinentOf<typeof REGIONS_CONFIG>;

export type WithRegion = { region: Region };
