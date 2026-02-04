"use server";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { createAddressAction } from "@/foundation/address/create-address-action";
import { updateCheckoutAddressAction } from "@/foundation/checkout/update-checkout-address-action";
import { storefrontLogger } from "@/services/logging";
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
    type: "BILLING",
  });

  if (saveAddressForFutureUse) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      await createAddressAction({
        accessToken,
        address: {
          ...billingAddress,
          country: billingAddress?.country as AllCountryCode,
        },
        type: "BILLING",
      });
    } else {
      storefrontLogger.error(
        "Access token not found while creating checkout billing address. Skipping address creation.",
      );
    }
  }

  return result;
}
