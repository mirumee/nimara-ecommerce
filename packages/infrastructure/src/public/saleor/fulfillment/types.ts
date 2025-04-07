import type { BaseError } from "@nimara/domain/objects/Error";

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
) => Promise<
  | { isSuccess: true }
  | { isSuccess: false }
  | {
      isSuccess: false;
      serverError: BaseError;
    }
  | {
      isSuccess: false;
      validationErrors: BaseError[];
    }
>;
export type FulfillmentReturnProductsUseCase = FulfillmentReturnProductsInfra;

export type SaleorFulfillmentServiceConfig = {
  apiURL: string;
  appToken: string;
  logger: Logger;
};

export type FulfillmentService<Config> = (config: Config) => {
  fulfillmentReturnProducts: FulfillmentReturnProductsInfra;
};
