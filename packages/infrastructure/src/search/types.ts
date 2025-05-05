import type { ProductOrder } from "@nimara/codegen/schema";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { type Logger } from "#root/logging/types";

import type { SearchProductFragment } from "./saleor/graphql/fragments/generated";

export type SearchProductSerializer<
  T extends Record<string, any> = Record<string, any>,
> = {
  (data: T): Readonly<SearchProduct>;
};

export type SaleorSearchServiceConfig = {
  apiURL: string;
  logger: Logger;
  serializers?: {
    search?: SearchProductSerializer<SearchProductFragment>;
  };
  settings: {
    sorting: Array<{
      messageKey: string;
      queryParamValue: string;
      saleorValue: ProductOrder;
    }>;
  };
};
