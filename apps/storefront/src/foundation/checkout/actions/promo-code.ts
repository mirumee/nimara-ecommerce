"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

/**
 * Fundamental action to add a promo code to a checkout.
 */
export const addPromoCodeAction = async ({
  checkoutId,
  promoCode,
}: {
  checkoutId: string;
  promoCode: string;
}) => {
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();

  const result = await checkoutService.checkoutAddPromoCode({
    checkoutId,
    promoCode,
  });

  if (result.ok) {
    revalidatePath(paths.checkout.asPath());
  }

  return result;
};

/**
 * Fundamental action to remove a promo code from a checkout.
 */
export const removePromoCodeAction = async ({
  checkoutId,
  promoCode,
}: {
  checkoutId: string;
  promoCode: string;
}) => {
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();

  const result = await checkoutService.checkoutRemovePromoCode({
    checkoutId,
    promoCode,
  });

  if (result.ok) {
    revalidatePath(paths.checkout.asPath());
  }

  return result;
};
