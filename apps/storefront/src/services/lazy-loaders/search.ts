import type { Logger } from "@nimara/infrastructure/logging/types";
import type { SaleorSearchServiceConfig } from "@nimara/infrastructure/search/saleor/types";
import type { SearchService } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";

/**
 * Creates a lazy loader function for the search service.
 * This function is only used by the service registry.
 * @internal
 */
export const createSearchServiceLoader = (logger: Logger) => {
  let searchServiceInstance: SearchService | null = null;

  const saleorSearchServiceConfig = (): SaleorSearchServiceConfig =>
    ({
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      settings: {
        sorting: [
          {
            saleorValue: {
              field: "NAME",
              direction: "ASC",
            },
            queryParamValue: "name-asc",
            messageKey: "search.name-asc",
          },
          {
            saleorValue: {
              field: "PRICE",
              direction: "DESC",
            },
            queryParamValue: "price-desc",
            messageKey: "search.price-desc",
          },
          {
            saleorValue: {
              field: "PRICE",
              direction: "ASC",
            },
            queryParamValue: "price-asc",
            messageKey: "search.price-asc",
          },
        ],
      },
      logger: logger,
    }) as const satisfies SaleorSearchServiceConfig;

  return async (): Promise<SearchService> => {
    if (searchServiceInstance) {
      return searchServiceInstance;
    }

    const { saleorSearchService } =
      await import("@nimara/infrastructure/search/saleor/provider");

    searchServiceInstance = saleorSearchService(saleorSearchServiceConfig());

    return searchServiceInstance;
  };
};
