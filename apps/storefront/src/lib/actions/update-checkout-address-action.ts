"use server";

import { type Address } from "@nimara/domain/objects/Address";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import { checkoutService } from "@/services/checkout";

export const updateCheckoutAddressAction = async ({
  type,
  ...values
}: {
  address: Partial<Omit<Address, "id">>;
  checkoutId: string;
  type: "shipping" | "billing";
}): AsyncResult<{
  success: true;
}> => {
  const updateFn =
    type === "shipping"
      ? checkoutService.checkoutShippingAddressUpdate
      : checkoutService.checkoutBillingAddressUpdate;

  const result = await updateFn(values);

  return result;
};
