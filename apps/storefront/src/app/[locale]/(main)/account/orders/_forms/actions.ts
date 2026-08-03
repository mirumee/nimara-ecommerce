"use server";

import type { Order } from "@nimara/domain/objects/Order";

import { revalidateLocalizedPath } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";
import { fulfillmentService } from "@/services/fulfillment";

import type { FormSchema } from "./schema";

export async function returnProducts(data: FormSchema, order: Order) {
  const fulfillmentLines = Object.entries(data.selectedLines)
    .filter(([_, isSelected]) => isSelected)
    .map(([lineId]) => {
      const fulfillmentLine = order.fulfillments
        .flatMap((fulfillment) => fulfillment.lines || [])
        .find((line) => line.orderLine?.id === lineId);

      return fulfillmentLine
        ? {
            fulfillmentLineId: fulfillmentLine.id,
            quantity: fulfillmentLine.quantity,
          }
        : null;
    })
    .filter(Boolean);

  const resultFulfillment = await fulfillmentService.fulfillmentReturnProducts({
    order: order.id,
    input: { fulfillmentLines },
  });

  await revalidateLocalizedPath(paths.account.orders.asPath());

  return resultFulfillment;
}
