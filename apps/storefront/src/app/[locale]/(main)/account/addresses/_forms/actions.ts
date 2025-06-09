"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";

import { getAccessToken } from "@/auth";
import { paths } from "@/lib/paths";
import { userService } from "@/services/user";

import type { FormSchema } from "./schema";

export async function createNewAddress({
  isDefaultShippingAddress,
  isDefaultBillingAddress,
  ...input
}: FormSchema) {
  const accessToken = await getAccessToken();

  const result = await userService.accountAddressCreate({
    input: {
      ...input,
      country: input.country as AllCountryCode,
    },
    ...(isDefaultBillingAddress && { type: "BILLING" }),
    accessToken,
  });

  if (isDefaultShippingAddress && result.ok) {
    if (isDefaultShippingAddress) {
      await userService.accountSetDefaultAddress({
        accessToken,
        id: result.data.id,
        type: "SHIPPING",
      });
    }
  }

  revalidatePath(paths.account.addresses.asPath());

  return result;
}

export async function updateAddress({
  id,
  input: { isDefaultShippingAddress, isDefaultBillingAddress, ...input },
}: {
  id: string;
  input: FormSchema;
}) {
  const accessToken = await getAccessToken();

  const data = await userService.accountAddressUpdate({
    accessToken,
    id,
    input: { ...input, country: input.country as AllCountryCode },
  });

  if (isDefaultShippingAddress) {
    await userService.accountSetDefaultAddress({
      accessToken,
      id,
      type: "SHIPPING",
    });
  }

  if (isDefaultBillingAddress) {
    await userService.accountSetDefaultAddress({
      accessToken,
      id,
      type: "BILLING",
    });
  }

  revalidatePath(paths.account.addresses.asPath());

  return data;
}

export async function deleteAddress(id: string) {
  const accessToken = await getAccessToken();

  const data = await userService.accountAddressDelete({
    accessToken,
    id,
  });

  revalidatePath(paths.account.addresses.asPath());

  return data;
}
