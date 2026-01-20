"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { updateCheckoutAddressAction } from "@/foundation/address/update-checkout-address-action";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import {
  type CreateShippingAddressSchema,
  type UpdateShippingAddressSchema,
} from "./schema";

/**
 * Updates the saved address in the user's account. After updating,
 * it revalidates the shipping address path to ensure the latest data is fetched.
 */
export async function accountAddressUpdateAction({
  id,
  input,
}: {
  id: string;
  input: UpdateShippingAddressSchema;
}) {
  const [accessToken, services] = await Promise.all([
    getAccessToken(),
    getServiceRegistry(),
  ]);
  const userService = await services.getUserService();

  const data = await userService.accountAddressUpdate({
    accessToken,
    id,
    input: { ...input, country: input.country as AllCountryCode },
  });

  if (data.ok) {
    revalidatePath(paths.checkout.shippingAddress.asPath());
  }

  return data;
}

export async function createCheckoutShippingAddress({
  checkoutId,
  input: { saveForFutureUse, ...input },
}: {
  checkoutId: Checkout["id"];
  input: CreateShippingAddressSchema;
}) {
  const result = await updateCheckoutAddressAction({
    checkoutId,
    address: schemaToAddress(input),
    type: "shipping",
  });

  if (saveForFutureUse) {
    const [accessToken, services] = await Promise.all([
      getAccessToken(),
      getServiceRegistry(),
    ]);
    const userService = await services.getUserService();

    await userService.accountAddressCreate({
      accessToken,
      input: { ...input, country: input.country as AllCountryCode },
      type: "SHIPPING",
    });
  }

  revalidatePath(paths.checkout.shippingAddress.asPath());

  return result;
}
