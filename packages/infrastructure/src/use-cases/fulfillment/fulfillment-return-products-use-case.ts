import type {
  FulfillmentReturnProductsInfra,
  FulfillmentReturnProductsOptions,
  FulfillmentReturnProductsUseCase,
} from "#root/fulfillment/types";

export const fulfillmentReturnProductsUseCase =
  ({
    fulfillmentReturnProducts,
  }: {
    fulfillmentReturnProducts: FulfillmentReturnProductsInfra;
  }): FulfillmentReturnProductsUseCase =>
  async (opts: FulfillmentReturnProductsOptions) => {
    return fulfillmentReturnProducts(opts);
  };
