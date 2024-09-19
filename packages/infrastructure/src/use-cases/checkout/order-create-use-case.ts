import type {
  OrderCreateInfra,
  OrderCreateUseCase,
} from "#root/public/saleor/checkout/types";

export const orderCreateUseCase =
  ({ orderCreate }: { orderCreate: OrderCreateInfra }): OrderCreateUseCase =>
  async (opts: { id: string }) => {
    return orderCreate(opts);
  };
