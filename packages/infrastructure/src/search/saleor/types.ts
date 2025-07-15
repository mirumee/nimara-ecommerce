import { type ProductOrder } from "@nimara/codegen/schema";

import { type Logger } from "#root/logging/types";
import { type SearchProductFragment } from "#root/search/saleor/graphql/fragments/generated";
import { type SearchProductSerializer } from "#root/search/types";

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
