import { ok } from "@nimara/domain/objects/Result";

import type { GetSortByOptionsInfra } from "#root/use-cases/search/types";

import type { SaleorSearchServiceConfig } from "../../types";

export const saleorGetSortByOptionsInfra =
  ({ settings }: SaleorSearchServiceConfig): GetSortByOptionsInfra =>
  () =>
    ok(
      settings.sorting.map((c) => ({
        value: c.queryParamValue,
        messageKey: c.messageKey,
      })),
    );
