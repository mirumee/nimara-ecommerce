"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { getCheckoutService } from "@/services/checkout";

export async function addPromoCode({
  checkoutId,
  promoCode,
}: {
  checkoutId: string;
  promoCode: string;
}) {
  const checkoutService = await getCheckoutService();
  const result = await checkoutService.checkoutAddPromoCode({
    checkoutId,
    promoCode,
  });

  revalidatePath(paths.checkout.asPath());

  return result;
}

export async function removePromoCode({
  checkoutId,
  promoCode,
}: {
  checkoutId: string;
  promoCode: string;
}) {
  const checkoutService = await getCheckoutService();
  const result = await checkoutService.checkoutRemovePromoCode({
    checkoutId,
    promoCode,
  });

  revalidatePath(paths.checkout.asPath());

  return result;
}
