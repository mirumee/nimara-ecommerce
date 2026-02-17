import { createCategories } from "../actions/create-categories";
import { createMediaForAllProducts } from "../actions/create-media-for-all-products";
import { createProductTypes } from "../actions/create-product-types";
import { createProducts } from "../actions/create-products";
import { fetchChannels } from "../actions/fetch-channels";
import mockDataRaw from "../mock-data.json";
import { MockData } from "../types";

const mockData = mockDataRaw as MockData;

/**
 * Seeds the products - creates categories, product types, products and media for products.
 * @returns Object with product ids, product type map and category map.
 */
export async function seedProducts(): Promise<{
  productIds: string[];
  productTypeMap: Record<string, string>;
  categoryMap: Record<string, string>;
}> {
  console.log("[SEEDING] Seeding mock store data foundation...");
  const categoryMap = await createCategories(mockData.categories);
  const productTypeMap = await createProductTypes(mockData.productTypes);

  console.log("[SEEDING] Fetching default channel...");
  const channels = await fetchChannels();
  const defaultChannel =
    channels.find((c) => c.slug === "default-channel") || channels[0];

  if (!defaultChannel) {
    throw new Error("No channel found in Saleor.");
  }

  const products = await createProducts(
    mockData.products,
    categoryMap,
    productTypeMap,
    defaultChannel.id,
  );

  await createMediaForAllProducts(products, mockData.products);

  return {
    productIds: products.map((p) => p.product?.id || ""),
    productTypeMap,
    categoryMap,
  };
}
