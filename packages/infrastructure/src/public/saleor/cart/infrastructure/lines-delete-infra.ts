import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { CartLinesDeleteMutationDocument } from "../graphql/mutations/generated";
import type { LinesDeleteInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesDeleteInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesDeleteInfra =>
  async ({ cartId, linesIds, options }) => {
    const result = await graphqlClientV2(apiURI).execute(
      CartLinesDeleteMutationDocument,
      {
        variables: {
          id: cartId,
          linesIds,
        },
        operationName: "CartLinesDeleteMutation",
        options,
      },
    );

    if (!result.ok) {
      logger.error("Error while deleting lines from cart", {
        error: result.error,
      });

      return result;
    }

    if (result.data.checkoutLinesDelete?.errors.length) {
      logger.error("Checkout lines delete mutation returned errors.", {
        error: result.data.checkoutLinesDelete.errors,
      });

      return err({
        code: "CART_LINES_DELETE_ERROR",
      });
    }

    return ok({ success: true });
  };
