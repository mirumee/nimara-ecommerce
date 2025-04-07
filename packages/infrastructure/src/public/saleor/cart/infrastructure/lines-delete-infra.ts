import { graphqlClient } from "#root/graphql/client";

import { CartLinesDeleteMutationDocument } from "../graphql/mutations/generated";
import type { LinesDeleteInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesDeleteInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesDeleteInfra =>
  async ({ cartId, linesIds, options }) => {
    const { data } = await graphqlClient(apiURI).execute(
      CartLinesDeleteMutationDocument,
      {
        variables: {
          id: cartId,
          linesIds,
        },

        options,
      },
    );

    if (data?.checkoutLinesDelete?.errors.length) {
      logger.error("Error while deleting lines from cart", {
        error: data.checkoutLinesDelete.errors,
        cartId,
      });

      return data.checkoutLinesDelete.errors;
    }

    return [];
  };
