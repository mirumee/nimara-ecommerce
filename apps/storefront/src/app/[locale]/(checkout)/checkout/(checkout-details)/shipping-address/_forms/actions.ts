"use server";

import { revalidatePath } from "next/cache";

import type { CountryCode } from "@nimara/codegen/schema";
import type { Checkout } from "@nimara/domain/objects/Checkout";

import { getAccessToken } from "@/auth";
import { updateCheckoutAddressAction } from "@/lib/actions/update-checkout-address-action";
import { schemaToAddress } from "@/lib/address";
import { paths } from "@/lib/paths";
import { userService } from "@/services";

import { type FormSchema } from "./schema";

export async function updateShippingAddress({
  id,
  input,
}: {
  id: string;
  input: FormSchema;
}) {
  const accessToken = await getAccessToken();

  const data = await userService.accountAddressUpdate({
    accessToken,
    id,
    input: { ...input, country: input.country as CountryCode },
  });

  revalidatePath(paths.checkout.shippingAddress.asPath());

  return data;
}

export async function createCheckoutShippingAddress({
  checkoutId,
  input: { saveForFutureUse, ...input },
}: {
  checkoutId: Checkout["id"];
  input: FormSchema;
}) {
  const accessToken = await getAccessToken();

  const data = await updateCheckoutAddressAction({
    checkoutId,
    address: schemaToAddress(input),
    type: "shipping",
  });

  if (saveForFutureUse) {
    await userService.accountAddressCreate({
      accessToken,
      input: { ...input, country: input.country as CountryCode },
      type: "SHIPPING",
    });
  }

  revalidatePath(paths.checkout.shippingAddress.asPath());

  return data;
}
