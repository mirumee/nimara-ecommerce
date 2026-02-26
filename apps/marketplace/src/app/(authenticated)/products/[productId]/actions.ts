"use server";

import { revalidatePath } from "next/cache";

import {
  ProductMediaCreateMutationDocument,
  type ProductMediaCreateMutationVariables,
  type ProductMediaDeleteMutationVariables,
  type ProductMediaReorderMutationVariables,
  type ProductMediaUpdateMutationVariables,
  type UpdateProductChannelListingVariables,
  type UpdateProductVariables,
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
  const result = await productsService.updateProductChannelListing(
    variables,
    token,
  );

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

/**
 * Upload product media (image) using multipart request.
 * Handles file uploads per GraphQL Multipart Request Spec.
 * https://github.com/jaydenseric/graphql-multipart-request-spec
 */
export async function uploadProductMedia(
  productId: string,
  file: File,
  alt?: string,
) {
  const token = await getServerAuthToken();

  if (!token) {
    return {
      ok: false as const,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  try {
    const graphqlEndpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_URL ||
      "http://localhost:3001/api/graphql";

    const formData = new FormData();
    const operations = {
      query: ProductMediaCreateMutationDocument.toString(),
      variables: {
        input: {
          product: productId,
          image: null,
          alt: alt ?? "",
        },
      },
      operationName: "ProductMediaCreateMutation",
    };
    const map = { "0": ["variables.input.image"] };

    formData.append("operations", JSON.stringify(operations));
    formData.append("map", JSON.stringify(map));
    formData.append("0", file, file.name);

    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        ok: false as const,
        errors: result.errors?.map((e: { code?: string; message: string }) => ({
          code: e.code || "GRAPHQL_ERROR",
          message: e.message,
        })) || [{ code: "HTTP_ERROR", message: "Failed to upload image" }],
      };
    }

    if (result.errors) {
      return {
        ok: false as const,
        errors: result.errors.map((e: { code?: string; message: string }) => ({
          code: e.code || "GRAPHQL_ERROR",
          message: e.message,
        })),
      };
    }

    if (!result.data?.productMediaCreate) {
      return {
        ok: false as const,
        errors: [
          { code: "NO_DATA", message: "No data returned from mutation" },
        ],
      };
    }

    const mutationErrors = result.data.productMediaCreate.errors || [];

    if (mutationErrors.length > 0) {
      return {
        ok: false as const,
        errors: mutationErrors.map((e: { message?: string | null }) => ({
          code: "MUTATION_ERROR",
          message: e.message ?? "Unknown error",
        })),
      };
    }

    revalidatePath(`/products/${productId}`);
    revalidatePath("/products");

    return {
      ok: true as const,
      data: result.data.productMediaCreate,
    };
  } catch (error) {
    return {
      ok: false as const,
      errors: [
        {
          code: "UNEXPECTED_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Unexpected error occurred",
        },
      ],
    };
  }
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

export async function productMediaReorder(
  variables: ProductMediaReorderMutationVariables,
  productId: string,
) {
  const token = await getServerAuthToken();
  const result = await productsService.productMediaReorder(variables, token);

  revalidatePath(`/products/${productId}`);

  return result;
}

export async function deleteProduct(productId: string) {
  const token = await getServerAuthToken();
  const result = await productsService.deleteProduct({ id: productId }, token);

  if (result.ok && result.data.productDelete?.product) {
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
  }

  return result;
}
