"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { updateDeliveryMethodAction } from "@/foundation/checkout/update-delivery-method-action";
import { paths } from "@/foundation/routing/paths";

export const updateDeliveryMethod = async ({
  deliveryMethodId,
  checkoutId,
}: {
  checkoutId: Checkout["id"];
  deliveryMethodId: string;
}): AsyncResult<{ redirectUrl: string }> => {
  const result = await updateDeliveryMethodAction({
    checkoutId,
    deliveryMethodId,
  });

  if (result.ok) {
    revalidatePath(paths.checkout.asPath());

    return ok({ redirectUrl: paths.checkout.payment.asPath() });
  }

  return result;
};
