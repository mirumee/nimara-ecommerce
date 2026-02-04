"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { getServiceRegistry } from "@/services/registry";

/**
 * Fundamental action to update the checkout email.
 * @param param0 Contains the checkout and the email to update.
 * @returns A promise that resolves to the result of the action.
 */
export const updateCheckoutEmailAction = async (data: {
  checkout: Checkout;
  email: string;
}) => {
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();
  const result = await checkoutService.checkoutEmailUpdate(data);

  return result;
};
