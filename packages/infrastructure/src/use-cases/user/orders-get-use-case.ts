import type { OrdersGetInfra, OrdersGetUseCase } from "#root/user/types";

export const ordersGetUseCase = ({
  ordersGetInfra,
}: {
  ordersGetInfra: OrdersGetInfra;
}): OrdersGetUseCase => {
  return ordersGetInfra;
};
