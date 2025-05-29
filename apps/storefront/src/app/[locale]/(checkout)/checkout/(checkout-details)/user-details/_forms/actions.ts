"use server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { serverEnvs } from "@/envs/server";
import { paths } from "@/lib/paths";
import { checkoutService } from "@/services/checkout";
import { userService } from "@/services/user";

import type { EmailFormSchema } from "./schema";

export const checkIfUserHasAnAccount = async (email: string) => {
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
  const result = await checkoutService.checkoutEmailUpdate({
    checkout,
    email: email,
  });

  if (result.ok) {
    return ok({ redirectUrl: paths.checkout.shippingAddress.asPath() });
  }

  return result;
};
