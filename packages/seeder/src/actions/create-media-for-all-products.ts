import { ProductBulkCreateResponse, ProductMock } from "../types";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;

export async function createMediaForAllProducts(
  results: ProductBulkCreateResponse["productBulkCreate"]["results"],
  seedProducts: ProductMock[],
): Promise<void> {
  console.log("[SEEDING] Creating media for all products...");

  const tasks = results
    .map((result, i) => ({
      product: result.product,
      photoUrl: seedProducts[i].photoUrl,
      index: i,
    }))
    .filter(
      (
        t,
      ): t is {
        product: NonNullable<typeof t.product>;
        photoUrl: string;
        index: number;
      } => t.product != null,
    );

  const promises = tasks.map(async ({ product, photoUrl, index }) => {
    try {
      console.log(`[SEEDING] Downloading image for ${product.name}...`);
      const imageRes = await fetch(photoUrl);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const file = new File([buffer], `cover-${index}.jpg`, {
        type: "image/jpeg",
      });

      const query = `
        mutation ProductMediaCreate($productId: ID!, $file: Upload!) {
          productMediaCreate(
            input: {
              product: $productId
              image: $file
              alt: "${product.name} cover"
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
          productId: product.id,
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
          `[SEEDING] Failed to create media for ${product.name}: ${JSON.stringify(errors)}`,
        );
      } else if (res.data?.productMediaCreate?.media) {
        console.log(
          `[SEEDING] Added media to product: ${product.name} (${product.id})`,
        );
      }
    } catch (error) {
      console.error(
        `[SEEDING] Request failed for product ${product.name} (${product.id})`,
        error,
      );
    }
  });

  await Promise.allSettled(promises);
}
