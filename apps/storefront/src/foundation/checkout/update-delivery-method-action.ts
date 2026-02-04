"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { getServiceRegistry } from "@/services/registry";

export const updateDeliveryMethodAction = async ({
  deliveryMethodId,
  checkoutId,
}: {
  checkoutId: Checkout["id"];
  deliveryMethodId: string;
}) => {
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();
  const result = await checkoutService.deliveryMethodUpdate({
    checkoutId,
    deliveryMethodId,
  });

  return result;
};
