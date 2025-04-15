import type { Cart } from "@nimara/domain/objects/Cart";
import { err, ok } from "@nimara/domain/objects/Result";

import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_SMALL } from "#root/config";
import { graphqlClientV2 } from "#root/graphql/client";
import { serializeLine } from "#root/utils";

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
    logger,
  }: SaleorCartServiceConfig): CartGetInfra =>
  async ({ cartId, options }) => {
    const result = await graphqlClientV2(apiURI).execute(CartQueryDocument, {
      variables: {
        id: cartId,
        languageCode,
        countryCode,
        thumbnailFormat: THUMBNAIL_FORMAT,
        thumbnailSize: THUMBNAIL_SIZE_SMALL,
      },
      options,
      operationName: "CartQuery",
    });

    if (!result.ok) {
      logger.error("Unexpecteed error while fetching cart", {
        error: result.error,
        cartId,
        languageCode,
        countryCode,
      });

      return result;
    }

    if (!result.data.checkout) {
      logger.error("Cart not found", {
        cartId,
        languageCode,
        countryCode,
      });

      return err({ code: "CART_NOT_FOUND_ERROR" });
    }

    return ok(serializeCart(result.data.checkout));
  };
