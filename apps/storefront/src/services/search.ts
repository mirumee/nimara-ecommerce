import { saleorSearchService } from "@nimara/infrastructure/public/saleor/search/providers";
import type { SearchService } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";

export const searchServiceSaleor = saleorSearchService({
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
});

export const searchService: SearchService = searchServiceSaleor;
