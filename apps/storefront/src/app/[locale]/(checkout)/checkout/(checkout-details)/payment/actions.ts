"use server";

import { revalidatePath } from "next/cache";

import type { CountryCode } from "@nimara/codegen/schema";
import type { Checkout } from "@nimara/domain/objects/Checkout";

import { getAccessToken } from "@/auth";
import { updateCheckoutAddressAction } from "@/lib/actions/update-checkout-address-action";
import { schemaToAddress } from "@/lib/address";
import { paths } from "@/lib/paths";
import { userService } from "@/services";

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
  const accessToken = await getAccessToken();

  const data = await updateCheckoutAddressAction({
    checkoutId: checkout.id,
    address: sameAsShippingAddress
      ? checkout.shippingAddress!
      : schemaToAddress(billingAddress!),
    type: "billing",
  });

  if (saveAddressForFutureUse && accessToken) {
    await userService.accountAddressCreate({
      accessToken,
      input: {
        ...billingAddress,
        country: billingAddress?.country as CountryCode,
      },
      type: "BILLING",
    });
  }

  revalidatePath(paths.checkout.payment.asPath());

  return data;
}
