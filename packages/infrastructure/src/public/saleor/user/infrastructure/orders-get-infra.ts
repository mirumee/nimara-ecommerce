import { graphqlClient } from "#root/graphql/client";
import { parseAttributeData } from "#root/lib/serializers/attribute";

import type { OrderFragment } from "../graphql/fragments/generated";
import { UserOrdersQueryDocument } from "../graphql/queries/generated";
import type { OrdersGetInfra, SaleorUserServiceConfig } from "../types";

export const saleorOrdersGetInfra =
  ({ apiURL }: SaleorUserServiceConfig): OrdersGetInfra =>
  async ({ accessToken, languageCode }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      UserOrdersQueryDocument,
      { variables: { languageCode } },
    );

    return (
      data?.me?.orders?.edges.map(({ node }) => serializeOrder(node)) ?? null
    );
  };

function serializeOrder({
  displayGrossPrices,
  total,
  ...order
}: OrderFragment) {
  const priceType = displayGrossPrices ? "gross" : "net";

  return {
    ...order,
    total: { ...total[priceType], type: priceType },
    lines: order?.lines.map(
      ({
        productName,
        variantName,
        translatedProductName,
        translatedVariantName,
        variant,
        totalPrice,
        ...orderLine
      }) => ({
        ...orderLine,
        productName: translatedProductName || productName,
        variantName: translatedVariantName || variantName,
        totalPrice: { ...totalPrice[priceType], type: priceType },
        variant: {
          ...variant,
          selectionAttributes:
            variant?.selectionAttributes.map(parseAttributeData) ?? [],
        },
      }),
    ),
  };
}
