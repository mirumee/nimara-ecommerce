import { graphqlClient } from "#root/graphql/client";

import { CartLinesDeleteMutationDocument } from "../graphql/mutations/generated";
import type { LinesDeleteInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesDeleteInfra =
  ({ apiURI }: SaleorCartServiceConfig): LinesDeleteInfra =>
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

    return data?.checkoutLinesDelete?.errors ?? [];
  };
