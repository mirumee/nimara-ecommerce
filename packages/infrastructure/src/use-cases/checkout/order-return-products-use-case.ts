import type {
  OrderReturnProductsInfra,
  OrderReturnProductsOptions,
  OrderReturnProductsUseCase,
} from "#root/public/saleor/checkout/types";

export const orderReturnProductsUseCase =
  ({
    orderReturnProducts,
  }: {
    orderReturnProducts: OrderReturnProductsInfra;
  }): OrderReturnProductsUseCase =>
  async (opts: OrderReturnProductsOptions) => {
    return orderReturnProducts(opts);
  };
