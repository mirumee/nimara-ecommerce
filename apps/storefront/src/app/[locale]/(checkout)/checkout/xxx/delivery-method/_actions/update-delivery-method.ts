"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { updateDeliveryMethodAction } from "@/foundation/checkout/actions/update-delivery-method-action";
import { paths } from "@/foundation/routing/paths";

export const updateDeliveryMethod = async ({
  deliveryMethodId,
  id,
}: {
  deliveryMethodId: string;
  id: Checkout["id"];
}): AsyncResult<{ redirectUrl: string }> => {
  const result = await updateDeliveryMethodAction({
    id,
    deliveryMethodId,
  });

  if (result.ok) {
    revalidatePath(paths.checkout.asPath());

    return ok({
      redirectUrl: paths.checkout.asPath({ query: { step: "payment" } }),
    });
  }

  return result;
};
