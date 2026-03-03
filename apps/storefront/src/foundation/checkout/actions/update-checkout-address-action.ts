"use server";

import { revalidatePath } from "next/cache";

import {
  type AddressCreateInput,
  type AddressType,
} from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

/**
 * Fundamental action to update the checkout address.
 * Address can be either for shipping or billing.
 * Requires access token.
 * @param param0 Contains the address data and the type of address to update.
 * @returns A promise that resolves to the result of the action.
 */
export const updateCheckoutAddressAction = async ({
  type,
  ...values
}: {
  address: Partial<AddressCreateInput>;
  id: Checkout["id"];
  type: AddressType;
}): AsyncResult<{
  success: true;
}> => {
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();

  const updateFn =
    type === "SHIPPING"
      ? checkoutService.checkoutShippingAddressUpdate
      : checkoutService.checkoutBillingAddressUpdate;

  const result = await updateFn(values);

  if (!result.ok) {
    return result;
  }

  revalidatePath(paths.checkout.asPath());

  return ok({ success: true });
};
