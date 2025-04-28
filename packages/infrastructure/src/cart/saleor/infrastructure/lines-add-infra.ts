import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { LinesAddInfra, SaleorCartServiceConfig } from "../../types";
import { CartLinesAddMutationDocument } from "../graphql/mutations/generated";

export const saleorLinesAddInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesAddInfra =>
  async ({ cartId, lines, options }) => {
    const result = await graphqlClient(apiURI).execute(
      CartLinesAddMutationDocument,
      {
        variables: {
          id: cartId,
          lines,
        },
        options,
        operationName: "CartLinesAddMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while adding lines to cart", {
        errors: result.errors,
      });

      return result;
    }

    if (result.data.checkoutLinesAdd?.errors.length) {
      logger.error("Checkout lines add mutation returned errors.", {
        error: result.data.checkoutLinesAdd.errors,
      });

      return err([
        {
          code: "CART_LINES_ADD_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
