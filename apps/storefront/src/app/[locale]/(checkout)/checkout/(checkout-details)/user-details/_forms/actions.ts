"use server";

import type { Checkout } from "@nimara/domain/objects/Checkout";

import { serverEnvs } from "@/envs/server";
import { paths } from "@/lib/paths";
import { checkoutService, userService } from "@/services";
import type { ServerError, TranslationMessage } from "@/types";

import type { EmailFormSchema } from "./schema";

type ValidationErrorsMap = Record<
  string,
  TranslationMessage<"checkout-errors">
>;

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
}): Promise<{
  errorsMap?: ValidationErrorsMap;
  redirectUrl?: string;
  serverError?: ServerError;
}> => {
  const { isSuccess, validationErrors, serverError } =
    await checkoutService.checkoutEmailUpdate({
      checkout,
      email: email,
    });

  if (!isSuccess) {
    if (serverError || !validationErrors) {
      return {
        serverError: { code: serverError?.message ?? "unknown" },
      };
    }

    const errorsMap = validationErrors.reduce(
      (acc, error) => ({
        ...acc,
        [error.field as string]: error.code,
      }),
      {},
    );

    return {
      errorsMap,
    };
  }

  return { redirectUrl: paths.checkout.shippingAddress.asPath() };
};
