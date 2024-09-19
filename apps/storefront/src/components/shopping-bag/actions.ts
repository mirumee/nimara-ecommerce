"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { checkoutService } from "@/services";

export async function addPromoCode({
  checkoutId,
  promoCode,
}: {
  checkoutId: string;
  promoCode: string;
}) {
  const data = await checkoutService.checkoutAddPromoCode({
    checkoutId,
    promoCode,
  });

  revalidatePath(paths.checkout.asPath());

  return data;
}

export async function removePromoCode({
  checkoutId,
  promoCode,
}: {
  checkoutId: string;
  promoCode: string;
}) {
  const data = await checkoutService.checkoutRemovePromoCode({
    checkoutId,
    promoCode,
  });

  revalidatePath(paths.checkout.asPath());

  return data;
}
