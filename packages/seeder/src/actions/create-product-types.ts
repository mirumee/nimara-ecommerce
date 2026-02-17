import { client } from "../client";
import { PRODUCT_TYPE_CREATE_MUTATION } from "../mutations";
import { ProductTypeCreateResponse, ProductTypeMock } from "../types";

/**
 * Creates product types.
 * @param productTypes - Array of product type objects.
 * @returns Map of product type names to product type ids.
 */
export async function createProductTypes(
  productTypes: ProductTypeMock[],
): Promise<Record<string, string>> {
  console.log("[SEEDING] Creating product types...");
  const mapping: Record<string, string> = {};

  for (const pt of productTypes) {
    const res = await client.request<ProductTypeCreateResponse>(
      PRODUCT_TYPE_CREATE_MUTATION,
      {
        input: {
          name: pt.name,
          hasVariants: pt.hasVariants,
          isShippingRequired: pt.isShippingRequired,
        },
      },
    );
    if (res.productTypeCreate.errors.length > 0) {
      throw new Error(
        `[SEEDING] Failed to create product type ${pt.name}: ${JSON.stringify(
          res.productTypeCreate.errors,
        )}`,
      );
    }
    mapping[pt.name] = res.productTypeCreate.productType!.id;
    console.log(`[SEEDING] Created product type: ${pt.name}`);
  }
  return mapping;
}
