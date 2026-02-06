"use server";

import { revalidatePath } from "next/cache";

import type {
  OrderCancelVariables,
  OrderFulfillmentCancelVariables,
  OrderFulfillVariables,
  OrderNoteAddVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { ordersService } from "@/services";

export async function fulfillOrder(variables: OrderFulfillVariables) {
  const token = await getServerAuthToken();
  const result = await ordersService.fulfillOrder(variables, token);

  revalidatePath(`/orders/${variables.order}`);

  return result;
}

export async function cancelFulfillment(
  variables: OrderFulfillmentCancelVariables,
  orderId: string,
) {
  const token = await getServerAuthToken();
  const result = await ordersService.cancelFulfillment(variables, token);

  revalidatePath(`/orders/${orderId}`);

  return result;
}

export async function cancelOrder(variables: OrderCancelVariables) {
  const token = await getServerAuthToken();
  const result = await ordersService.cancelOrder(variables, token);

  revalidatePath(`/orders/${variables.id}`);
  revalidatePath("/orders");

  return result;
}

export async function addOrderNote(
  variables: OrderNoteAddVariables,
  orderId: string,
) {
  const token = await getServerAuthToken();
  const result = await ordersService.addOrderNote(variables, token);

  revalidatePath(`/orders/${orderId}`);

  return result;
}
