"use server";

import { revalidatePath } from "next/cache";

import type {
  ProductCreateMutationVariables,
  ProductMediaCreateMutationVariables,
  ProductTypeDetailVariables,
  ProductVariantChannelListingAddInput,
  UpdateProductChannelListingVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

export type DefaultVariantPayload = {
  channelAvailability: Record<
    string,
    { isAvailableForPurchase?: boolean; isPublished?: boolean }
  >;
  channelListings: Array<{
    channelId: string;
    costPrice?: string;
    price?: string;
  }>;
  productName: string;
  sku?: string;
  weight: { unit: string; value: number } | null;
};

export async function createProduct(variables: ProductCreateMutationVariables) {
  const token = await getServerAuthToken();
  const result = await productsService.createProduct(variables, token);

  if (result.ok && result.data.productCreate?.product?.id) {
    const productId = result.data.productCreate.product.id;

    revalidatePath(`/products/${productId}`);
    revalidatePath("/products");
  }

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

export async function getProductTypeDetail(
  variables: ProductTypeDetailVariables,
) {
  const token = await getServerAuthToken();

  return productsService.getProductType(variables, token);
}

/**
 * After creating a product with a product type that has hasVariants=false,
 * create the single variant and its channel listings (same as Saleor dashboard:
 * ProductCreate → ProductChannelListingUpdate → VariantCreate → ProductVariantChannelListingUpdate).
 */
export async function createDefaultVariantAfterProductCreate(
  productId: string,
  payload: DefaultVariantPayload,
) {
  const token = await getServerAuthToken();

  // Variant name: use SKU when present (like Saleor dashboard). When no SKU, create with placeholder
  // then set name to variant ID after create (Saleor shows variant ID as name when no SKU).
  const skuTrimmed = payload.sku?.trim();
  const hasSku = Boolean(skuTrimmed);
  const variantName = hasSku
    ? skuTrimmed
    : payload.productName.trim() || "Default";

  const createResult = await productsService.productVariantCreate(
    {
      input: {
        attributes: [],
        product: productId,
        name: variantName,
        sku: skuTrimmed ?? undefined,
        weight:
          payload.weight && payload.weight.value > 0
            ? {
                value: payload.weight.value,
                unit: payload.weight.unit || "KG",
              }
            : undefined,
      },
    },
    token,
  );

  if (!createResult.ok) {
    return createResult;
  }

  const createErrors = createResult.data.productVariantCreate?.errors ?? [];

  if (createErrors.length > 0) {
    return {
      ok: false as const,
      data: createResult.data,
      errors: createErrors.map((e) => ({
        message: e.message ?? e.code ?? "Variant create failed",
      })),
    };
  }

  const variantId = createResult.data.productVariantCreate?.productVariant?.id;

  if (!variantId) {
    return {
      ok: false as const,
      data: null,
      errors: [{ message: "Variant was created but ID is missing" }],
    };
  }

  // When no SKU, set variant name to variant ID (Saleor dashboard behavior)
  if (!hasSku) {
    const updateResult = await productsService.productVariantUpdate(
      { id: variantId, input: { name: variantId } },
      token,
    );

    if (!updateResult.ok) {
      return updateResult;
    }

    const updateErrors = updateResult.data.productVariantUpdate?.errors ?? [];

    if (updateErrors.length > 0) {
      return {
        ok: false as const,
        data: updateResult.data,
        errors: updateErrors.map((e) => ({
          message: e.message ?? e.code ?? "Variant name update failed",
        })),
      };
    }
  }

  // Assign the new variant to every channel the product is in (addVariants).
  // Otherwise the variant is not "in" the channel and pricing/availability won't show.
  const channelIdsToAssign = payload.channelListings
    .filter((l) => payload.channelAvailability[l.channelId] !== undefined)
    .map((l) => l.channelId);

  if (channelIdsToAssign.length > 0) {
    const productListingResult =
      await productsService.updateProductChannelListing(
        {
          id: productId,
          input: {
            removeChannels: [],
            updateChannels: channelIdsToAssign.map((channelId) => ({
              addVariants: [variantId],
              channelId,
            })),
          },
        },
        token,
      );

    if (!productListingResult.ok) {
      return productListingResult;
    }

    const productListingErrors =
      productListingResult.data.productChannelListingUpdate?.errors ?? [];

    if (productListingErrors.length > 0) {
      return {
        ok: false as const,
        data: productListingResult.data,
        errors: productListingErrors.map((e) => ({
          message:
            e.message ?? e.code ?? "Assigning variant to channels failed",
        })),
      };
    }
  }

  // Channel listings: only for channels that are published and have a valid price
  const channelListingsInput: ProductVariantChannelListingAddInput[] = [];

  for (const listing of payload.channelListings) {
    const config = payload.channelAvailability[listing.channelId];

    if (!config?.isPublished) {
      continue;
    }

    const price = listing.price ? parseFloat(listing.price) : NaN;

    if (Number.isNaN(price) || price < 0) {
      continue;
    }

    const costPrice = listing.costPrice
      ? parseFloat(listing.costPrice)
      : undefined;

    channelListingsInput.push({
      channelId: listing.channelId,
      costPrice:
        costPrice !== undefined && !Number.isNaN(costPrice)
          ? costPrice
          : undefined,
      price,
    });
  }

  if (channelListingsInput.length > 0) {
    const listingResult =
      await productsService.productVariantChannelListingUpdate(
        { id: variantId, input: channelListingsInput },
        token,
      );

    if (!listingResult.ok) {
      return listingResult;
    }

    const listingErrors =
      listingResult.data.productVariantChannelListingUpdate?.errors ?? [];

    if (listingErrors.length > 0) {
      return {
        ok: false as const,
        data: listingResult.data,
        errors: listingErrors.map((e) => ({
          message: e.message ?? e.code ?? "Channel listing update failed",
        })),
      };
    }
  }

  revalidatePath(`/products/${productId}`);

  return { ok: true as const, data: createResult.data, errors: [] };
}
