import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type Logger } from "#root/logging/types";

export type FulfillmentReturnProductsOptions = {
  input: {
    fulfillmentLines: {
      fulfillmentLineId: string;
      quantity: number;
    }[];
  };
  order: string;
};

export type FulfillmentReturnProductsInfra = (
  opts: FulfillmentReturnProductsOptions,
) => AsyncResult<{ success: boolean }>;
export type FulfillmentReturnProductsUseCase = FulfillmentReturnProductsInfra;

export type SaleorFulfillmentServiceConfig = {
  apiURL: string;
  appToken: string;
  logger: Logger;
};

export type FulfillmentService<Config> = (config: Config) => {
  fulfillmentReturnProducts: FulfillmentReturnProductsInfra;
};
