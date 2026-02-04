"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { createAddressAction } from "@/foundation/address/create-address-action";
import { updateCheckoutAddressAction } from "@/foundation/checkout/update-checkout-address-action";
import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";
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

/**
 * Creates a new shipping address for the checkout.
 * @param checkoutId - The ID of the checkout.
 * @param input - The input data for the shipping address.
 * @returns A promise that resolves to the result of the action.
 */
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
    type: "SHIPPING",
  });

  if (saveForFutureUse) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const createAddressResult = await createAddressAction({
        accessToken,
        address: schemaToAddress(input),
        type: "SHIPPING",
      });

      if (!createAddressResult.ok) {
        storefrontLogger.error(
          "Error while creating checkout shipping address.",
          { result: createAddressResult },
        );
      }
    } else {
      storefrontLogger.error(
        "Access token not found while creating checkout shipping address. Skipping address creation.",
      );
    }
  }

  revalidatePath(paths.checkout.shippingAddress.asPath());

  return result;
}
