import type { ProductOrder } from "@nimara/codegen/schema";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import type { SearchProductFragment } from "./graphql/fragments/generated";

export type SearchProductSerializer<
  T extends Record<string, any> = Record<string, any>,
> = {
  (data: T): Readonly<SearchProduct>;
};

export type SaleorSearchServiceConfig = {
  apiURL: string;
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
