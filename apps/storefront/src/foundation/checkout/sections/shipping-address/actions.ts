"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { createAddressAction } from "@/foundation/address/create-address-action";
import { updateCheckoutAddressAction } from "@/foundation/checkout/actions/update-checkout-address-action";
import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import {
  type CreateShippingAddressSchema,
  type UpdateShippingAddressSchema,
} from "./schema";

interface AccountAddressUpdateActionPayload {
  id: string;
  input: UpdateShippingAddressSchema;
}

/**
 * Updates the saved address in the user's account. After updating,
 * it revalidates the shipping address step to ensure the latest data is fetched.
 */
export async function accountAddressUpdateAction({
  id,
  input,
}: AccountAddressUpdateActionPayload) {
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
    revalidatePath(paths.checkout.asPath());
  }

  return data;
}

interface CreateCheckoutShippingAddressPayload {
  id: Checkout["id"];
  input: CreateShippingAddressSchema;
}

/**
 * Creates or updates checkout shipping address and optionally persists it.
 */
export async function createCheckoutShippingAddress({
  id,
  input: { saveForFutureUse, ...input },
}: CreateCheckoutShippingAddressPayload) {
  const result = await updateCheckoutAddressAction({
    id,
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

  revalidatePath(paths.checkout.asPath());

  return result;
}
