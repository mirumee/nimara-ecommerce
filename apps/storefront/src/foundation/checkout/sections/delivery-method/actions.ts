"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { updateDeliveryMethodAction } from "@/foundation/checkout/actions/update-delivery-method-action";
import { paths } from "@/foundation/routing/paths";

interface UpdateCheckoutDeliveryMethodPayload {
  deliveryMethodId: string;
  id: Checkout["id"];
}

export const updateCheckoutDeliveryMethod = async ({
  deliveryMethodId,
  id,
}: UpdateCheckoutDeliveryMethodPayload): AsyncResult<{
  redirectUrl: string;
}> => {
  const result = await updateDeliveryMethodAction({
    id,
    deliveryMethodId,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath(paths.checkout.asPath());

  return ok({
    redirectUrl: paths.checkout.asPath({ query: { step: "payment" } }),
  });
};

export const updateMarketplaceDeliveryMethods = async ({
  selectionsByCheckoutId,
}: {
  selectionsByCheckoutId: Record<string, string>;
}): AsyncResult<{
  redirectUrl: string;
}> => {
  const entries = Object.entries(selectionsByCheckoutId).filter(
    (entry): entry is [string, string] =>
      !!entry[0] && typeof entry[1] === "string" && entry[1].length > 0,
  );

  if (!entries.length) {
    return {
      ok: false,
      errors: [{ code: "CHECKOUT_DELIVERY_METHOD_UPDATE_ERROR" }],
    };
  }

  const results = await Promise.all(
    entries.map(([checkoutId, deliveryMethodId]) =>
      updateDeliveryMethodAction({
        id: checkoutId,
        deliveryMethodId,
      }),
    ),
  );

  const failedResult = results.find((result) => !result.ok);

  if (failedResult && !failedResult.ok) {
    return failedResult;
  }

  revalidatePath(paths.checkout.asPath());

  return ok({
    redirectUrl: paths.checkout.asPath({ query: { step: "payment" } }),
  });
};
