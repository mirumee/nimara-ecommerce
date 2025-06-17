import { type AllCurrency } from "@nimara/domain/consts";
import type { Cart } from "@nimara/domain/objects/Cart";
import { err, ok } from "@nimara/domain/objects/Result";

import { serializeCheckoutProblems } from "#root/checkout/saleor/serializers";
import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_SMALL } from "#root/config";
import { graphqlClient } from "#root/graphql/client";
import { serializeLine } from "#root/utils";

import type { CartGetInfra, SaleorCartServiceConfig } from "../../types";
import type { CartFragment } from "../graphql/fragments/generated";
import { CartQueryDocument } from "../graphql/queries/generated";

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
    total: {
      ...totalPrice.gross,
      currency: totalPrice.gross.currency as AllCurrency,
    },
    subtotal: {
      amount: lines.reduce(
        (sum, line) => sum + line.undiscountedTotalPrice.amount,
        0,
      ),
      currency: lines[0]?.undiscountedTotalPrice.currency as AllCurrency,
    },
    lines: lines.map((line) => serializeLine(line, priceType)),
    problems: serializeCheckoutProblems(problems, priceType),
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
    const result = await graphqlClient(apiURI).execute(CartQueryDocument, {
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
        errors: result.errors,
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

      return err([{ code: "CART_NOT_FOUND_ERROR" }]);
    }

    return ok(serializeCart(result.data.checkout));
  };
