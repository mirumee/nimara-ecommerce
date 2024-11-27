import type { BaseError } from "@nimara/domain/objects/Error";

export type FulfillmentReturnProductsOptions = {
  input: {
    orderLines: {
      orderLineId: string;
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
      validationErrors: { code: string; field: string | null }[];
    }
>;
export type FulfillmentReturnProductsUseCase = FulfillmentReturnProductsInfra;

export type SaleorFulfillmentServiceConfig = {
  apiURL: string;
  appToken: string;
};

export type FulfillmentService<Config> = (config: Config) => {
  fulfillmentReturnProducts: FulfillmentReturnProductsInfra;
};
