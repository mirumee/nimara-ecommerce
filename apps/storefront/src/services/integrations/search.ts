import type { Logger } from "@nimara/infrastructure/logging/types";
import type { IndicesSettings } from "@nimara/infrastructure/search/algolia/types";
import type { SaleorSearchServiceConfig } from "@nimara/infrastructure/search/saleor/types";
import { type SearchServiceConfig } from "@nimara/infrastructure/search/select";

import { clientEnvs } from "@/envs/client";

export const ALGOLIA_INDICES: IndicesSettings = [];

const SALEOR_SORTING = [
  {
    saleorValue: { field: "NAME", direction: "ASC" },
    queryParamValue: "name-asc",
    messageKey: "search.name-asc",
  },
  {
    saleorValue: { field: "PRICE", direction: "DESC" },
    queryParamValue: "price-desc",
    messageKey: "search.price-desc",
  },
  {
    saleorValue: { field: "PRICE", direction: "ASC" },
    queryParamValue: "price-asc",
    messageKey: "search.price-asc",
  },
] as const satisfies SaleorSearchServiceConfig["settings"]["sorting"];

/**
 * App-owned configuration passed to the infrastructure provider factory. Each
 * section is included only when its data is present; the selected provider's
 * section is validated by `createSearchService`.
 */
export const buildSearchConfig = (logger: Logger): SearchServiceConfig => ({
  logger,
  saleor: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL
    ? {
        apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        settings: { sorting: SALEOR_SORTING },
      }
    : undefined,
  algolia:
    clientEnvs.ALGOLIA_APP_ID &&
    clientEnvs.ALGOLIA_API_KEY &&
    ALGOLIA_INDICES.length > 0
      ? {
          credentials: {
            appId: clientEnvs.ALGOLIA_APP_ID,
            apiKey: clientEnvs.ALGOLIA_API_KEY,
          },
          settings: { indices: ALGOLIA_INDICES },
        }
      : undefined,
});
