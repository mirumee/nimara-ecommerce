import { graphqlClient } from "#root/graphql/client";

import { CartLinesUpdateMutationDocument } from "../graphql/mutations/generated";
import type { LinesUpdateInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesUpdateInfra =
  ({ apiURI }: SaleorCartServiceConfig): LinesUpdateInfra =>
  async ({ cartId, lines, options }) => {
    const { data } = await graphqlClient(apiURI).execute(
      CartLinesUpdateMutationDocument,
      {
        variables: {
          id: cartId,
          lines,
        },

        options,
      },
    );

    return data?.checkoutLinesUpdate?.errors ?? [];
  };
