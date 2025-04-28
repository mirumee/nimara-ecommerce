import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { LinesUpdateInfra, SaleorCartServiceConfig } from "../../types";
import { CartLinesUpdateMutationDocument } from "../graphql/mutations/generated";

export const saleorLinesUpdateInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesUpdateInfra =>
  async ({ cartId, lines, options }) => {
    const result = await graphqlClient(apiURI).execute(
      CartLinesUpdateMutationDocument,
      {
        variables: {
          id: cartId,
          lines,
        },
        operationName: "CartLinesUpdateMutation",
        options,
      },
    );

    if (!result.ok) {
      logger.error("Error while updating lines in cart", {
        errors: result.errors,
      });

      return result;
    }

    if (result.data.checkoutLinesUpdate?.errors.length) {
      logger.error("Checkout lines update mutation returned errors.", {
        error: result.data.checkoutLinesUpdate.errors,
      });

      return err([
        {
          code: "CART_LINES_UPDATE_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
