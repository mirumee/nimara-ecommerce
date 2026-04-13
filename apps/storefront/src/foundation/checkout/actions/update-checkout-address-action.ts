"use server";

import { revalidatePath } from "next/cache";

import {
  type AddressCreateInput,
  type AddressType,
} from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { getCheckoutIds } from "@/features/checkout/cart";
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
  revalidateCheckout = true,
  ...values
}: {
  address: Partial<AddressCreateInput>;
  id: Checkout["id"];
  /**
   * When false, skips revalidatePath (e.g. immediately before Stripe redirect).
   * @see updateBillingAddress in payment/actions.ts
   */
  revalidateCheckout?: boolean;
  type: AddressType;
}): AsyncResult<{
  success: true;
}> => {
  const isMarketplaceEnabled =
    process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false";
  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();

  const updateFn =
    type === "SHIPPING"
      ? checkoutService.checkoutShippingAddressUpdate
      : checkoutService.checkoutBillingAddressUpdate;

  if (isMarketplaceEnabled) {
    const checkoutIds = await getCheckoutIds();
    const targetCheckoutIds = checkoutIds.length ? checkoutIds : [values.id];
    const results = await Promise.all(
      targetCheckoutIds.map((id) =>
        updateFn({
          ...values,
          id,
        }),
      ),
    );
    const failedResult = results.find((result) => !result.ok);

    if (failedResult && !failedResult.ok) {
      return failedResult;
    }
  } else {
    const result = await updateFn(values);

    if (!result.ok) {
      return result;
    }
  }

  if (revalidateCheckout) {
    revalidatePath(paths.checkout.asPath());
  }

  return ok({ success: true });
};
