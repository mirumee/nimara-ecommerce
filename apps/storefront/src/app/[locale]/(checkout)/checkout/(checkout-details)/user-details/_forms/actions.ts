"use server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { serverEnvs } from "@/envs/server";
import { updateCheckoutEmailAction } from "@/foundation/checkout/update-checkout-email-action";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import type { EmailFormSchema } from "./schema";

export const checkIfUserHasAnAccount = async (email: string) => {
  const services = await getServiceRegistry();
  const userService = await services.getUserService();
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
  const result = await updateCheckoutEmailAction({
    checkout,
    email,
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
