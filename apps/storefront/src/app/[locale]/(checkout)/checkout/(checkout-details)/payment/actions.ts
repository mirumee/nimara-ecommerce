"use server";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { updateCheckoutAddressAction } from "@/foundation/address/update-checkout-address-action";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { type Schema } from "./schema";

export async function updateBillingAddress({
  checkout,
  input: { sameAsShippingAddress, billingAddress, saveAddressForFutureUse },
}: {
  checkout: Checkout;
  input: Pick<
    Schema,
    "sameAsShippingAddress" | "billingAddress" | "saveAddressForFutureUse"
  >;
}) {
  const result = await updateCheckoutAddressAction({
    checkoutId: checkout.id,
    address: sameAsShippingAddress
      ? checkout.shippingAddress!
      : schemaToAddress(billingAddress!),
    type: "billing",
  });

  if (saveAddressForFutureUse) {
    const [accessToken, services] = await Promise.all([
      getAccessToken(),
      getServiceRegistry(),
    ]);
    const userService = await services.getUserService();

    await userService.accountAddressCreate({
      accessToken,
      input: {
        ...billingAddress,
        country: billingAddress?.country as AllCountryCode,
      },
      type: "BILLING",
    });
  }

  return result;
}
