import { graphqlClient } from "#root/graphql/client";

import { CartLinesAddMutationDocument } from "../graphql/mutations/generated";
import type { LinesAddInfra, SaleorCartServiceConfig } from "../types";

export const saleorLinesAddInfra =
  ({ apiURI }: SaleorCartServiceConfig): LinesAddInfra =>
  async ({ cartId, lines, options }) => {
    const { data } = await graphqlClient(apiURI).execute(
      CartLinesAddMutationDocument,
      {
        variables: {
          id: cartId,
          lines,
        },
        options,
      },
    );

    return data?.checkoutLinesAdd?.errors ?? [];
  };
