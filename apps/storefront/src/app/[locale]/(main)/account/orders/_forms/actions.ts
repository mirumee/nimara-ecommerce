"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { checkoutService } from "@/services";

import type { FormSchema } from "./schema";

export async function returnProducts(data: FormSchema, orderId: string) {
  const selectedOrderLines = Object.entries(data.selectedLines)
    .filter(([_, isSelected]) => isSelected)
    .map(([lineId]) => ({
      orderLineId: lineId,
      quantity: 0, // TODO correct qty
    }));

  const response = await checkoutService.orderReturnProducts({
    order: orderId,
    input: { orderLines: selectedOrderLines },
  });

  revalidatePath(paths.account.orders.asPath());

  return response;
}
