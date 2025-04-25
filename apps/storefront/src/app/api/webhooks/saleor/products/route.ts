import { secureSaleorClient } from "@/graphql/client";
import { type ProductEventSubscriptionFragment } from "@/graphql/fragments/generated";
import { ProductSlugQueryDocument } from "@/graphql/queries/generated";
import { storefrontLogger } from "@/services/logging";

import { handleWebhookPostRequest } from "../helpers";

const logger = storefrontLogger;

const extractSlugFromPayload = async (
  json: ProductEventSubscriptionFragment,
) => {
  switch (json?.__typename) {
    case "ProductUpdated":
    case "ProductDeleted":
    case "ProductMetadataUpdated":
      return json.product?.slug;

    case "ProductMediaCreated":
    case "ProductMediaUpdated":
    case "ProductMediaDeleted":
      const result = await secureSaleorClient().execute(
        ProductSlugQueryDocument,
        {
          variables: { id: json.productMedia!.productId! },
          operationName: "ProductSlugQuery",
        },
      );

      if (!result.ok) {
        logger.error("[Saleor webhook handler] Failed to fetch product slug", {
          productId: json.productMedia?.productId,
        });
      }

      return result.data?.product?.slug;

    case "ProductVariantUpdated":
    case "ProductVariantCreated":
    case "ProductVariantDeleted":
    case "ProductVariantBackInStock":
    case "ProductVariantOutOfStock":
    case "ProductVariantMetadataUpdated":
    case "ProductVariantStockUpdated":
      return json.productVariant?.product.slug;
  }
};

export async function POST(request: Request) {
  return handleWebhookPostRequest(
    request,
    (json: ProductEventSubscriptionFragment) => extractSlugFromPayload(json),
    "PRODUCT",
  );
}
