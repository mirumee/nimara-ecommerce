import type { BaseError } from "@nimara/domain/objects/Error";

import { type Logger } from "#root/logging/types";
import { AsyncResult } from "@nimara/domain/objects/Result";

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
