import { graphqlClient } from "#root/graphql/client";
import { ProductVariantVendorQueryDocument } from "#root/store/saleor/graphql/queries/generated";
import { getVendorIdFromMetadata } from "#root/store/saleor/vendor-metadata";

/**
 * Fetches the product's vendor ID for a given variant ID (from product metadata).
 *
 * @param apiURI - Saleor GraphQL API URL
 * @param variantId - Product variant ID
 * @param channel - Channel slug (required when multiple channels exist)
 * @returns The vendor ID string if present in product metadata, otherwise null
 */
export async function getProductVendorIdByVariantId(
  apiURI: string,
  variantId: string,
  channel: string,
): Promise<string | null> {
  const result = await graphqlClient(apiURI).execute(
    ProductVariantVendorQueryDocument,
    {
      variables: { id: variantId, channel },
      operationName: "ProductVariantVendorQuery",
    },
  );

  if (!result.ok) {
    return null;
  }

  const metadata = result.data.productVariant?.product?.metadata;

  return getVendorIdFromMetadata(metadata ?? null);
}
