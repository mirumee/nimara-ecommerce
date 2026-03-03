"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { getServiceRegistry } from "@/services/registry";

export const updateDeliveryMethodAction = async (payload: {
  deliveryMethodId: string;
  id: Checkout["id"];
}) => {
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();
  const result = await checkoutService.deliveryMethodUpdate(payload);

  return result;
};
