"use server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { serverEnvs } from "@/envs/server";
import { getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getCheckoutService } from "@/services/checkout";
import { getUserService } from "@/services/user";

import type { EmailFormSchema } from "./schema";

export const checkIfUserHasAnAccount = async (email: string) => {
  const userService = await getUserService();
  const data = await userService.userFind({
    email,
    saleorAppToken: serverEnvs.SALEOR_APP_TOKEN,
  });

  return data;
};

export const updateUserDetails = async ({
  email,
  checkout,
}: {
  checkout: Checkout;
  email: EmailFormSchema["email"];
}): AsyncResult<{ redirectUrl: string }> => {
  const checkoutService = await getCheckoutService();

  if (serverEnvs.MARKETPLACE_MODE) {
    const marketplaceCheckoutIds = await getMarketplaceCheckoutIds();
    const checkoutIds = marketplaceCheckoutIds.length
      ? marketplaceCheckoutIds
      : [checkout.id];
    const region = await getCurrentRegion();

    for (const checkoutId of checkoutIds) {
      const resultCheckoutGet = await checkoutService.checkoutGet({
        checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
      });

      if (!resultCheckoutGet.ok) {
        return resultCheckoutGet;
      }

      const resultEmailUpdate = await checkoutService.checkoutEmailUpdate({
        checkout: resultCheckoutGet.data.checkout,
        email,
      });

      if (!resultEmailUpdate.ok) {
        return resultEmailUpdate;
      }
    }

    return ok({
      redirectUrl: checkout.isShippingRequired
        ? paths.checkout.shippingAddress.asPath()
        : paths.checkout.payment.asPath(),
    });
  }

  const result = await checkoutService.checkoutEmailUpdate({
    checkout,
    email: email,
  });

  if (result.ok) {
    return ok({
      redirectUrl: checkout.isShippingRequired
        ? paths.checkout.shippingAddress.asPath()
        : paths.checkout.payment.asPath(),
    });
  }

  return result;
};
