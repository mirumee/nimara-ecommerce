import { secureSaleorClient } from "@/graphql/client";
import { type ProductEventSubscriptionFragment } from "@/graphql/fragments/generated";
import { ProductSlugQueryDocument } from "@/graphql/queries/generated";

import { handleWebhookPostRequest } from "../helpers";

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
      const { data } = await secureSaleorClient().execute(
        ProductSlugQueryDocument,
        {
          variables: { id: json.productMedia!.productId! },
        },
      );

      return data?.product?.slug;

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
