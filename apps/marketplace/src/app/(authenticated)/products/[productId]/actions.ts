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
import { getAppConfig } from "@/lib/saleor/app-config";
import {
  getSaleorDomainFromToken,
  getSaleorGraphQLEndpoint,
} from "@/lib/saleor/domain";
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
 *
 * NOTE: File uploads must go directly to Saleor's GraphQL endpoint because
 * schema stitching via graphql-tools doesn't support multipart file uploads.
 * We use the app token (not user token) because users don't have MANAGE_PRODUCTS permission.
 */
export async function uploadProductMedia(
  productId: string,
  file: File,
  alt?: string,
) {
  const userToken = await getServerAuthToken();

  if (!userToken) {
    return {
      ok: false as const,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  try {
    // Get Saleor domain from user's JWT
    const saleorDomain = getSaleorDomainFromToken(userToken);

    if (!saleorDomain) {
      return {
        ok: false as const,
        errors: [
          {
            code: "CONFIG_ERROR",
            message: "Could not determine Saleor domain",
          },
        ],
      };
    }

    // Get app config to retrieve the app token (has MANAGE_PRODUCTS permission)
    const appConfig = await getAppConfig(saleorDomain);

    if (!appConfig?.authToken) {
      return {
        ok: false as const,
        errors: [
          {
            code: "CONFIG_ERROR",
            message: "App not configured for this Saleor instance",
          },
        ],
      };
    }

    // File uploads must go directly to Saleor (schema stitching doesn't handle multipart)
    const graphqlEndpoint = getSaleorGraphQLEndpoint(saleorDomain);

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

    // Send multipart request directly to Saleor using app token (has required permissions)
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${appConfig.authToken}` },
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
