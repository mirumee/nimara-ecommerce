"use server";

import { revalidatePath } from "next/cache";

import type { ProductVariantBulkUpdateMutationVariables } from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

export async function productVariantBulkUpdate(
  variables: ProductVariantBulkUpdateMutationVariables,
  productId: string,
  variantId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productVariantBulkUpdate(variables, token);

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/products/${productId}/variants/${variantId}`);

  return result;
}

