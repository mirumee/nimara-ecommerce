"use server";

import { revalidatePath } from "next/cache";

import type { Order } from "@nimara/domain/objects/Order";

import { paths } from "@/lib/paths";
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

  revalidatePath(paths.account.orders.asPath());

  return resultFulfillment;
}
