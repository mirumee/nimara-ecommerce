import type { Order, OrderLine } from "@nimara/domain/objects/Order";

export const isOrderLineReturned = (order: Order, line: OrderLine) => {
  return order.fulfillments?.some(
    (fulfillment) =>
      fulfillment.status === "RETURNED" &&
      fulfillment.lines?.some(
        (fulfillmentLine) => fulfillmentLine.orderLine?.id === line.id,
      ),
  );
};
