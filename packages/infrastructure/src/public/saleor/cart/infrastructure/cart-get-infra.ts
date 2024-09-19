import type { Cart } from "@nimara/domain/objects/Cart";

import { graphqlClient } from "#root/graphql/client";
import { serializeLine } from "#root/utils";

import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE } from "../config";
import type { CartFragment } from "../graphql/fragments/generated";
import { CartQueryDocument } from "../graphql/queries/generated";
import type { CartGetInfra, SaleorCartServiceConfig } from "../types";

const serializeCart = ({
  id,
  lines,
  totalPrice,
  displayGrossPrices,
  problems,
}: CartFragment): Cart => {
  const priceType = displayGrossPrices ? "gross" : "net";

  return {
    id,
    linesCount: lines.length,
    linesQuantityCount:
      lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0,
    total: totalPrice.gross,
    subtotal: {
      amount: lines.reduce(
        (sum, line) => sum + line.undiscountedTotalPrice.amount,
        0,
      ),
      currency: lines[0]?.undiscountedTotalPrice.currency,
    },
    lines: lines.map((line) => serializeLine(line, priceType)),
    problems: {
      insufficientStock:
        problems
          ?.filter((p) => "availableQuantity" in p && p)
          ?.map((p) => ({
            ...p,
            line: serializeLine(p.line, priceType),
          })) ?? [],
    },
  };
};

export const saleorCartGetInfra =
  ({
    apiURI,
    languageCode,
    countryCode,
  }: SaleorCartServiceConfig): CartGetInfra =>
  async ({ cartId, options }) => {
    const { data } = await graphqlClient(apiURI).execute(CartQueryDocument, {
      variables: {
        id: cartId,
        languageCode,
        countryCode,
        thumbnailFormat: THUMBNAIL_FORMAT,
        thumbnailSize: THUMBNAIL_SIZE,
      },
      options,
    });

    if (data?.checkout) {
      return serializeCart(data.checkout);
    }

    return null;
  };
