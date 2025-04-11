import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { CartLinesUpdateMutationDocument } from "../graphql/mutations/generated";
import type { LinesUpdateInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesUpdateInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesUpdateInfra =>
  async ({ cartId, lines, options }) => {
    const result = await graphqlClientV2(apiURI).execute(
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
        error: result.error,
      });

      return result;
    }

    if (result.data.checkoutLinesUpdate?.errors.length) {
      logger.error("Checkout lines update mutation returned errors.", {
        error: result.data.checkoutLinesUpdate.errors,
      });

      return err({
        code: "CART_LINES_UPDATE_ERROR",
      });
    }

    return ok({ success: true });
  };
