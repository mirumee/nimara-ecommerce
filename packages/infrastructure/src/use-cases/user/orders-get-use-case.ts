import type {
  OrdersGetInfra,
  OrdersGetUseCase,
} from "#root/public/saleor/user/types";

export const ordersGetUseCase = ({
  ordersGetInfra,
}: {
  ordersGetInfra: OrdersGetInfra;
}): OrdersGetUseCase => {
  return ordersGetInfra;
};
