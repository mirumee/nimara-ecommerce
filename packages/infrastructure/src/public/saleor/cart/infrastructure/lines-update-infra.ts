import { graphqlClient } from "#root/graphql/client";

import { CartLinesUpdateMutationDocument } from "../graphql/mutations/generated";
import type { LinesUpdateInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesUpdateInfra =
  ({ apiURI, logger }: SaleorCartServiceConfig): LinesUpdateInfra =>
  async ({ cartId, lines, options }) => {
    const { data, error } = await graphqlClient(apiURI).execute(
      CartLinesUpdateMutationDocument,
      {
        variables: {
          id: cartId,
          lines,
        },

        options,
      },
    );

    if (error) {
      logger.error("Error while updating lines in cart", { error, cartId });

      return [];
    }

    return data?.checkoutLinesUpdate?.errors ?? [];
  };
