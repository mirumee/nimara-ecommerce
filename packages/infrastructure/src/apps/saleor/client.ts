import { ok } from "@nimara/domain/objects/Result";

import { AppIdQueryDocument } from "#root/apps/saleor/graphql/queries/generated";
import { type SaleorAppClientFactory } from "#root/apps/saleor/types";
import { graphqlClient } from "#root/graphql/client";

export const saleorAppClient: SaleorAppClientFactory = ({
  authToken,
  saleorUrl,
}) => {
  const client = graphqlClient(`${saleorUrl}/graphql/`, authToken);

  return {
    getAppId: async () => {
      const result = await client.execute(AppIdQueryDocument);

      if (!result.ok) {
        return result;
      }

      return ok(result.data.app?.id ?? null);
    },
  };
};
