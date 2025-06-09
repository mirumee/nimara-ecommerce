import { type AllCurrency } from "@nimara/domain/consts";
import { ok } from "@nimara/domain/objects/Result";

import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_MEDIUM } from "#root/config";
import { graphqlClient } from "#root/graphql/client";
import { parseAttributeData } from "#root/lib/serializers/attribute";

import type { OrdersGetInfra, SaleorUserServiceConfig } from "../../types";
import type { OrderFragment } from "../graphql/fragments/generated";
import { UserOrdersQueryDocument } from "../graphql/queries/generated";

export const saleorOrdersGetInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): OrdersGetInfra =>
  async ({ accessToken, languageCode }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      UserOrdersQueryDocument,
      {
        variables: {
          languageCode,
          thumbnailFormat: THUMBNAIL_FORMAT,
          thumbnailSize: THUMBNAIL_SIZE_MEDIUM,
        },
        operationName: "UserOrdersQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching orders", { errors: result.errors });

      return result;
    }

    return ok(
      result.data?.me?.orders?.edges.map(({ node }) => serializeOrder(node)) ??
        [],
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
    total: {
      ...total[priceType],
      currency: total[priceType].currency as AllCurrency,
      type: priceType,
    },
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
        totalPrice: {
          ...totalPrice[priceType],
          currency: total[priceType].currency as AllCurrency,
          type: priceType,
        },
        variant: {
          ...variant,
          selectionAttributes:
            variant?.selectionAttributes.map(parseAttributeData) ?? [],
        },
      }),
    ),
  };
}
