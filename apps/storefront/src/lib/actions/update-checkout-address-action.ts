"use server";

import { type Address } from "@nimara/domain/objects/Address";

import { checkoutService } from "@/services";
import { type TranslationMessage } from "@/types";

export const updateCheckoutAddressAction = async ({
  address,
  checkoutId,
  type,
}: {
  address: Partial<Omit<Address, "id">>;
  checkoutId: string;
  type: "shipping" | "billing";
}): Promise<{
  errors: { field: null | string; message: TranslationMessage }[];
  numberOfUnavailableProducts: number;
}> => {
  let numberOfUnavailableProducts = 0;
  const updateFn =
    type === "shipping"
      ? checkoutService.checkoutShippingAddressUpdate
      : checkoutService.checkoutBillingAddressUpdate;

  const { isSuccess, validationErrors, serverError } = await updateFn({
    checkoutId,
    address,
  });

  if (!isSuccess) {
    if (serverError) {
      return {
        errors: [{ message: "server-errors.unknown", field: null }],
        numberOfUnavailableProducts,
      };
    }

    if (validationErrors) {
      numberOfUnavailableProducts = validationErrors.filter(
        (error) => error.code === "INSUFFICIENT_STOCK",
      ).length;

      return {
        errors: validationErrors.map(({ code, field }) => ({
          field,
          message: `checkout-errors.${code}` as TranslationMessage,
        })),
        numberOfUnavailableProducts,
      };
    }
  }

  return { errors: [], numberOfUnavailableProducts };
};
