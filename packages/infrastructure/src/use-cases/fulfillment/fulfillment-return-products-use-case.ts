import type {
  FulfillmentReturnProductsInfra,
  FulfillmentReturnProductsOptions,
  FulfillmentReturnProductsUseCase,
} from "#root/public/saleor/fulfillment/types";

export const fulfillmentReturnProductsUseCase =
  ({
    fulfillmentReturnProducts,
  }: {
    fulfillmentReturnProducts: FulfillmentReturnProductsInfra;
  }): FulfillmentReturnProductsUseCase =>
  async (opts: FulfillmentReturnProductsOptions) => {
    return fulfillmentReturnProducts(opts);
  };
