"use server";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";

import { getAccessToken } from "@/auth";
import { updateCheckoutAddressAction } from "@/lib/actions/update-checkout-address-action";
import { schemaToAddress } from "@/lib/address";
import { userService } from "@/services/user";

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
    const accessToken = await getAccessToken();

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
