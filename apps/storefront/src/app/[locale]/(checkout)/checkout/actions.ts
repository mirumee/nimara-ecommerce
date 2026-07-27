"use server";

import { revalidatePath } from "next/cache";

import { type AddressCreateInput } from "@nimara/domain/objects/Address";

import * as foundationActions from "@/foundation/checkout/actions";
import { paths } from "@/foundation/routing/paths";
import { getLocalizedPath } from "@/foundation/server";

export const updateCheckoutAddressAction = async ({
  id,
  address,
}: {
  address: Partial<AddressCreateInput>;
  id: string;
}) => {
  const result = await foundationActions.updateCheckoutAddressAction({
    id,
    address,
    type: "SHIPPING",
  });

  if (result.ok) {
    revalidatePath(await getLocalizedPath(paths.checkout.asPath()));
  }

  return result;
};
