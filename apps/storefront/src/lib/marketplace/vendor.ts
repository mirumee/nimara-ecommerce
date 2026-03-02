import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

const VENDOR_METADATA_KEY = "vendor.id";

type VariantVendorQueryResult = {
  data?: {
    productVariant?: {
      product?: {
        metafield?: string | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

export const getVendorIdForVariant = async (variantId: string) => {
  const response = await fetch(clientEnvs.NEXT_PUBLIC_SALEOR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      query: `
        query ProductVariantVendorID($variantId: ID!, $vendorKey: String!) {
          productVariant(id: $variantId) {
            product {
              metafield(key: $vendorKey)
            }
          }
        }
      `,
      variables: {
        variantId,
        vendorKey: VENDOR_METADATA_KEY,
      },
    }),
  });

  if (!response.ok) {
    storefrontLogger.error("Failed to fetch variant vendor metadata.", {
      variantId,
      status: response.status,
    });

    return null;
  }

  const payload = (await response.json()) as VariantVendorQueryResult;

  if (payload.errors?.length) {
    storefrontLogger.error("Variant vendor metadata query returned errors.", {
      variantId,
      errors: payload.errors,
    });

    return null;
  }

  const vendorId = payload.data?.productVariant?.product?.metafield;

  return vendorId && vendorId.trim().length > 0 ? vendorId : null;
};
