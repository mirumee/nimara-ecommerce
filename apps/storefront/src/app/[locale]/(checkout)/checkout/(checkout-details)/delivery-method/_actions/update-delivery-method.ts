"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getCheckoutService } from "@/services/checkout";

export const updateDeliveryMethod = async ({
  deliveryMethodId,
  checkout,
}: {
  checkout: Checkout;
  deliveryMethodId: string;
}): AsyncResult<{ redirectUrl: string }> => {
  const checkoutService = await getCheckoutService();
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

export const updateMarketplaceDeliveryMethods = async ({
  deliveryMethods,
}: {
  deliveryMethods: Array<{ checkoutId: string; deliveryMethodId: string }>;
}): AsyncResult<{ redirectUrl: string }> => {
  const checkoutService = await getCheckoutService();
  const region = await getCurrentRegion();

  for (const { checkoutId, deliveryMethodId } of deliveryMethods) {
    const resultCheckoutGet = await checkoutService.checkoutGet({
      checkoutId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
    });

    if (!resultCheckoutGet.ok) {
      return resultCheckoutGet;
    }

    const resultUpdate = await checkoutService.deliveryMethodUpdate({
      checkout: resultCheckoutGet.data.checkout,
      deliveryMethodId,
    });

    if (!resultUpdate.ok) {
      return resultUpdate;
    }
  }

  revalidatePath(paths.checkout.asPath());

  return ok({ redirectUrl: paths.checkout.payment.asPath() });
};
