import type {
  OrderCreateInfra,
  OrderCreateUseCase,
} from "#root/checkout/types";

export const orderCreateUseCase =
  ({ orderCreate }: { orderCreate: OrderCreateInfra }): OrderCreateUseCase =>
  async (opts: { id: string }) => {
    return orderCreate(opts);
  };
