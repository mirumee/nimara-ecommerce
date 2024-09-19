import type { GetSortByOptionsInfra } from "#root/use-cases/search/types";

import type { SaleorSearchServiceConfig } from "../types";

export const saleorGetSortByOptionsInfra =
  ({ settings }: SaleorSearchServiceConfig): GetSortByOptionsInfra =>
  () => ({
    options: settings.sorting.map((c) => ({
      value: c.queryParamValue,
      messageKey: c.messageKey,
    })),
  });
