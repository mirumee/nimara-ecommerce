"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { serverEnvs } from "@/envs/server";
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
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();
  const result = await checkoutService.checkoutEmailUpdate(payload);

  if (opts.revalidateCheckoutPathOnSuccess && result.ok) {
    revalidatePath(paths.checkout.asPath());
  }

  return result;
};
