"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { ok } from "@nimara/domain/objects/Result";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { getCheckoutIds } from "@/features/checkout/cart";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

/**
 * Payload for the update checkout user details action.
 */
interface UpdateCheckoutUserDetailsPayload {
  /**
   * The checkout to update.
   */
  checkout: Checkout;
  /**
   * The email to update.
   */
  email: string;
}

interface UpdateCheckoutUserDetailsOpts {
  revalidateCheckoutPathOnSuccess?: boolean;
}

export const checkIfUserHasAnAccount = async (email: string) => {
  const services = await getServiceRegistry();
  const userService = await services.getUserService();

  return userService.userFind({
    email,
    saleorAppToken: serverEnvs.SALEOR_APP_TOKEN,
  });
};

/**
 * Fundamental action to update the checkout email.
 * @param param0 Contains the checkout and the email to update.
 * @returns A promise that resolves to the result of the action.
 */
export const updateCheckoutUserDetailsAction = async (
  payload: UpdateCheckoutUserDetailsPayload,
  opts: UpdateCheckoutUserDetailsOpts = {},
) => {
  const isMarketplaceEnabled = clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED;
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();

  if (isMarketplaceEnabled) {
    const checkoutIds = await getCheckoutIds();
    const targetCheckoutIds = checkoutIds.length
      ? checkoutIds
      : [payload.checkout.id];
    const results = await Promise.all(
      targetCheckoutIds.map((checkoutId) =>
        checkoutService.checkoutEmailUpdate({
          ...payload,
          checkout: {
            ...payload.checkout,
            id: checkoutId,
          },
        }),
      ),
    );
    const failedResult = results.find((result) => !result.ok);

    if (failedResult && !failedResult.ok) {
      return failedResult;
    }
  } else {
    const result = await checkoutService.checkoutEmailUpdate(payload);

    if (!result.ok) {
      return result;
    }
  }

  if (opts.revalidateCheckoutPathOnSuccess) {
    revalidatePath(paths.checkout.asPath());
  }

  return ok({ success: true });
};
