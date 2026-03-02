"use server";

import { type Address } from "@nimara/domain/objects/Address";
import { type AsyncResult,ok } from "@nimara/domain/objects/Result";

import { serverEnvs } from "@/envs/server";
import { getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { getCheckoutService } from "@/services/checkout";

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
  const checkoutService = await getCheckoutService();
  const updateFn =
    type === "shipping"
      ? checkoutService.checkoutShippingAddressUpdate
      : checkoutService.checkoutBillingAddressUpdate;

  if (!serverEnvs.MARKETPLACE_MODE) {
    return updateFn(values);
  }

  const marketplaceCheckoutIds = await getMarketplaceCheckoutIds();
  const checkoutIds = marketplaceCheckoutIds.length
    ? marketplaceCheckoutIds
    : [values.checkoutId];

  for (const checkoutId of checkoutIds) {
    const result = await updateFn({
      ...values,
      checkoutId,
    });

    if (!result.ok) {
      return result;
    }
  }

  return ok({ success: true });
};
