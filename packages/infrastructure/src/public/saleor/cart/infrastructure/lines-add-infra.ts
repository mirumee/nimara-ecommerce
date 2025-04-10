import { graphqlClient } from "#root/graphql/client";

import { CartLinesAddMutationDocument } from "../graphql/mutations/generated";
import type { LinesAddInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesAddInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesAddInfra =>
  async ({ cartId, lines, options }) => {
    const { data, error } = await graphqlClient(apiURI).execute(
      CartLinesAddMutationDocument,
      {
        variables: {
          id: cartId,
          lines,
        },
        options,
      },
    );

    if (error) {
      logger.error("Error while adding lines to cart", { error, cartId });

      return [];
    }

    if (data?.checkoutLinesAdd?.errors.length) {
      logger.error("Error while adding lines to cart", {
        error: data.checkoutLinesAdd.errors,
        cartId,
      });

      return data?.checkoutLinesAdd?.errors ?? [];
    }

    return data?.checkoutLinesAdd?.errors ?? [];
  };
