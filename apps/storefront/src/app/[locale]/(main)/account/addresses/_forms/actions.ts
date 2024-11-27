"use server";

import { revalidatePath } from "next/cache";

import { type CountryCode } from "@nimara/codegen/schema";

import { getAccessToken } from "@/auth";
import { paths } from "@/lib/paths";
import { userService } from "@/services";

import type { FormSchema } from "./schema";

export async function createNewAddress({
  isDefaultShippingAddress,
  isDefaultBillingAddress,
  ...input
}: FormSchema) {
  const accessToken = await getAccessToken();

  const newAddress = await userService.accountAddressCreate({
    input: {
      ...input,
      country: input.country as CountryCode,
    },
    ...(isDefaultBillingAddress && { type: "BILLING" }),
    accessToken,
  });

  if (isDefaultShippingAddress && newAddress?.address?.id) {
    if (isDefaultShippingAddress) {
      await userService.accountSetDefaultAddress({
        accessToken,
        id: newAddress.address.id,
        type: "SHIPPING",
      });
    }
  }

  revalidatePath(paths.account.addresses.asPath());

  return newAddress;
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
    input: { ...input, country: input.country as CountryCode },
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
