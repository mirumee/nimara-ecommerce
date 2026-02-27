"use server";

import { revalidatePath } from "next/cache";

import {
  type CollectionChannelListingUpdateMutationVariables,
  CollectionUpdateMutationDocument,
  type CollectionUpdateMutationVariables,
  type ProductsVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { collectionsService, productsService } from "@/services";

export async function updateCollection(
  variables: CollectionUpdateMutationVariables,
  collectionId: string,
) {
  const token = await getServerAuthToken();
  const result = await collectionsService.updateCollection(variables, token);

  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/collections");

  return result;
}

export async function updateCollectionChannelListing(
  variables: CollectionChannelListingUpdateMutationVariables,
  collectionId: string,
) {
  const token = await getServerAuthToken();
  const result = await collectionsService.updateCollectionChannelListing(
    variables,
    token,
  );

  revalidatePath(`/collections/${collectionId}`);

  return result;
}

export async function deleteCollection(collectionId: string) {
  const token = await getServerAuthToken();
  const result = await collectionsService.deleteCollection(
    { id: collectionId },
    token,
  );

  if (result.ok && result.data.collectionDelete?.collection) {
    revalidatePath("/collections");
    revalidatePath(`/collections/${collectionId}`);
  }

  return result;
}

export async function addProductsToCollection(
  collectionId: string,
  productIds: string[],
) {
  const token = await getServerAuthToken();
  const result = await collectionsService.addProductsToCollection(
    {
      collectionId,
      products: productIds,
    },
    token,
  );

  if (result.ok) {
    revalidatePath(`/collections/${collectionId}`);
  }

  return result;
}

export async function removeProductsFromCollection(
  collectionId: string,
  productIds: string[],
) {
  const token = await getServerAuthToken();
  const result = await collectionsService.removeProductsFromCollection(
    {
      collectionId,
      products: productIds,
    },
    token,
  );

  if (result.ok) {
    revalidatePath(`/collections/${collectionId}`);
  }

  return result;
}

export async function getAvailableProducts(variables?: ProductsVariables) {
  const token = await getServerAuthToken();

  return productsService.getProducts(variables, token);
}

/**
 * Upload collection background image using multipart request.
 * This function handles file uploads which require multipart/form-data.
 * Follows the GraphQL Multipart Request Specification: https://github.com/jaydenseric/graphql-multipart-request-spec
 */
export async function uploadCollectionBackgroundImage(
  collectionId: string,
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
    // Get GraphQL endpoint
    const graphqlEndpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_URL ||
      "http://localhost:3001/api/graphql";

    // Create FormData for multipart request following GraphQL Multipart Request Spec
    const formData = new FormData();

    // Create the operations JSON - the file will be referenced as a variable
    const operations = {
      query: CollectionUpdateMutationDocument.toString(),
      variables: {
        id: collectionId,
        input: {
          backgroundImage: null, // Placeholder - will be replaced by file reference
          ...(alt && { backgroundImageAlt: alt }),
        },
      },
      operationName: "CollectionUpdateMutation",
    };

    // Map the file to the variable path
    // The key "0" corresponds to the file we'll append, and the value is the path in variables
    const map = {
      "0": ["variables.input.backgroundImage"],
    };

    // Append operations and map as JSON strings
    formData.append("operations", JSON.stringify(operations));
    formData.append("map", JSON.stringify(map));

    // Append the file - the key "0" matches the map above
    formData.append("0", file, file.name);

    // Send multipart request
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type header - browser will set it with boundary
      },
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

    if (!result.data?.collectionUpdate) {
      return {
        ok: false as const,
        errors: [
          { code: "NO_DATA", message: "No data returned from mutation" },
        ],
      };
    }

    const errors = result.data.collectionUpdate.errors || [];

    if (errors.length > 0) {
      return {
        ok: false as const,
        errors: errors.map((e: { code?: string; message: string }) => ({
          code: e.code || "MUTATION_ERROR",
          message: e.message,
        })),
      };
    }

    revalidatePath(`/collections/${collectionId}`);
    revalidatePath("/collections");

    return {
      ok: true as const,
      data: result.data.collectionUpdate,
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
