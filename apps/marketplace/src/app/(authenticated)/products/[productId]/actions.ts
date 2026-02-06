"use server";

import { revalidatePath } from "next/cache";

import type {
  ProductMediaCreateMutationVariables,
  ProductMediaDeleteMutationVariables,
  ProductMediaUpdateMutationVariables,
  UpdateProductChannelListingVariables,
  UpdateProductVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

export async function updateProduct(
  variables: UpdateProductVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.updateProduct(variables, token);

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");

  return result;
}

export async function updateProductChannelListing(
  variables: UpdateProductChannelListingVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.updateProductChannelListing(variables, token);

  revalidatePath(`/products/${productId}`);

  return result;
}

export async function productMediaCreate(
  variables: ProductMediaCreateMutationVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productMediaCreate(variables, token);
  revalidatePath(`/products/${productId}`);
  return result;
}

export async function productMediaUpdate(
  variables: ProductMediaUpdateMutationVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productMediaUpdate(variables, token);
  revalidatePath(`/products/${productId}`);
  return result;
}

export async function productMediaDelete(
  variables: ProductMediaDeleteMutationVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productMediaDelete(variables, token);
  revalidatePath(`/products/${productId}`);
  return result;
}
