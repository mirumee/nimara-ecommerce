import { client } from "../client";
import { PRODUCT_BULK_CREATE_MUTATION } from "../mutations";
import { MockData, ProductBulkCreateResponse } from "../types";

export async function createProducts(
  products: MockData["products"],
  categoryMap: Record<string, string>,
  productTypeMap: Record<string, string>,
  channelId: string,
): Promise<ProductBulkCreateResponse["productBulkCreate"]["results"]> {
  console.log("[SEEDING] Creating products in bulk...");

  const inputs = products.map((p) => ({
    name: p.name,
    category: categoryMap[p.category],
    productType: productTypeMap[p.productType],
    description: JSON.stringify({
      time: 123,
      blocks: [{ type: "paragraph", data: { text: p.description } }],
      version: "2.20.0",
    }),
    variants: p.variants
      ? p.variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          attributes: [],
          channelListings: [
            {
              channelId,
              price: v.price.toString(),
            },
          ],
        }))
      : [
          {
            sku: p.sku,
            name: "Standard",
            attributes: [],
            channelListings: [
              {
                channelId,
                price: p.price!.toString(),
              },
            ],
          },
        ],
    channelListings: [
      {
        channelId,
        isPublished: true,
        isAvailableForPurchase: true,
        visibleInListings: true,
      },
    ],
  }));

  const res = await client.request<ProductBulkCreateResponse>(
    PRODUCT_BULK_CREATE_MUTATION,
    { input: inputs },
  );

  res.productBulkCreate.results.forEach((result, index) => {
    if (result.errors && result.errors.length > 0) {
      console.error(
        `[SEEDING] Failed to create product ${products[index].name}: ${JSON.stringify(result.errors)}`,
      );
    } else if (result.product) {
      console.log(
        `[SEEDING] Created product: ${result.product.name} (${result.product.id})`,
      );
    }
  });

  return res.productBulkCreate.results;
}
