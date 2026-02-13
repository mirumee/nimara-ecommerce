import { MockData, ProductBulkCreateResponse } from "../types";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;

/**
 * Creates media for all products.
 * @param products - Array of product objects.
 * @param seedProducts - Array of seed product objects.
 */
export async function createMediaForAllProducts(
  products: ProductBulkCreateResponse["productBulkCreate"]["results"],
  seedProducts: MockData["products"],
): Promise<void> {
  console.log("[SEEDING] Creating media for all products...");

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const photoUrl = seedProducts[i]?.photoUrl;

    if (!photoUrl) {
      console.log(`[SEEDING] Skipping product ${product.product!.name} - no photo URL`);
      continue;
    };

    try {
      console.log(
        `[SEEDING] Downloading image for ${product.product!.name}...`,
      );
      const imageRes = await fetch(photoUrl);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const file = new File([buffer], `cover-${i}.jpg`, {
        type: "image/jpeg",
      });

      const query = `
        mutation ProductMediaCreate($productId: ID!, $file: Upload!) {
          productMediaCreate(
            input: {
              product: $productId
              image: $file
              alt: "${product.product!.name} cover"
            }
          ) {
            media {
              id
              url
            }
            errors {
              field
              message
            }
          }
        }
      `;

      const operations = JSON.stringify({
        query,
        variables: {
          productId: product.product!.id,
          file: null,
        },
      });

      const map = JSON.stringify({
        0: ["variables.file"],
      });

      const formData = new FormData();
      formData.append("operations", operations);
      formData.append("map", map);
      formData.append("0", file);

      const response = await fetch(SALEOR_API_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
        },
        body: formData,
      });

      const res = await response.json();
      const errors = res.data?.productMediaCreate?.errors;

      if (errors?.length > 0) {
        console.error(
          `[SEEDING] Failed to create media for ${product.product!.name}: ${JSON.stringify(errors)}`,
        );
      } else if (res.data?.productMediaCreate?.media) {
        console.log(
          `[SEEDING] Added media to product: ${product.product!.name} (${product.product!.id})`,
        );
      }
    } catch (error) {
      console.error(
        `[SEEDING] Request failed for product ${product.product!.name} (${product.product!.id})`,
        error,
      );
    }
  }
}
