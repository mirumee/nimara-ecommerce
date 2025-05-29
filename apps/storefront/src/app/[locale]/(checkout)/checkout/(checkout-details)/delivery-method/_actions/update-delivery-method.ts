"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { paths } from "@/lib/paths";
import { checkoutService } from "@/services/checkout";

export const updateDeliveryMethod = async ({
  deliveryMethodId,
  checkout,
}: {
  checkout: Checkout;
  deliveryMethodId: string;
}): AsyncResult<{ redirectUrl: string }> => {
  const result = await checkoutService.deliveryMethodUpdate({
    checkout,
    deliveryMethodId,
  });

  if (result.ok) {
    revalidatePath(paths.checkout.asPath());

    return ok({ redirectUrl: paths.checkout.payment.asPath() });
  }

  return result;
};
