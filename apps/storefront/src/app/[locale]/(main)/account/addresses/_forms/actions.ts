"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";

import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import type { FormSchema } from "./schema";

export async function createNewAddress({
  isDefaultShippingAddress,
  isDefaultBillingAddress,
  ...input
}: FormSchema) {
  const [accessToken, services] = await Promise.all([
    getAccessToken(),
    getServiceRegistry(),
  ]);
  const userService = await services.getUserService();

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
  const [accessToken, services] = await Promise.all([
    getAccessToken(),
    getServiceRegistry(),
  ]);
  const userService = await services.getUserService();

  const data = await userService.accountAddressDelete({
    accessToken,
    id,
  });

  revalidatePath(paths.account.addresses.asPath());

  return data;
}
