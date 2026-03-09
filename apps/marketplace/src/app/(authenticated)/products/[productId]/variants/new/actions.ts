"use server";

import { revalidatePath } from "next/cache";

import type {
  ProductVariantChannelListingUpdateMutationVariables,
  ProductVariantCreateMutationVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

export async function createProductVariant(
  variables: ProductVariantCreateMutationVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productVariantCreate(variables, token);

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/products/${productId}/variants`);

  return result;
}

export async function updateProductVariantChannelListing(
  variables: ProductVariantChannelListingUpdateMutationVariables,
  productId: string,
  variantId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productVariantChannelListingUpdate(
    variables,
    token,
  );

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/products/${productId}/variants/${variantId}`);

  return result;
}
