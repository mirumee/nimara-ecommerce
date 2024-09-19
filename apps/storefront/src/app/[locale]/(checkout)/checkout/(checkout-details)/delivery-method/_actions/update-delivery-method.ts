"use server";

import { revalidatePath } from "next/cache";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { paths } from "@/lib/paths";
import { checkoutService } from "@/services";
import { type ServerError, type TranslationMessage } from "@/types";

type ValidationErrorsMap = Record<
  string,
  TranslationMessage<"checkout-errors">
>;

export const updateDeliveryMethod = async ({
  deliveryMethodId,
  checkout,
}: {
  checkout: Checkout;
  deliveryMethodId: string;
}): Promise<{
  errorsMap?: ValidationErrorsMap;
  redirectUrl?: string;
  serverError?: ServerError;
}> => {
  const { isSuccess, validationErrors, serverError } =
    await checkoutService.deliveryMethodUpdate({
      checkout,
      deliveryMethodId,
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

  revalidatePath(paths.checkout.asPath());

  return { redirectUrl: paths.checkout.payment.asPath() };
};
