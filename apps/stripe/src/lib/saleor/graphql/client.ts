import { graphqlClient } from "#graphql/client";

import { AppIdQueryDocument } from "./generated";
import { type SaleorClientFactory } from "./types";

export const saleorClient: SaleorClientFactory = ({
  saleorUrl,
  authToken,
  timeout,
}) => {
  const client = graphqlClient(`${saleorUrl}/graphql/`, {
    authToken,
    timeout,
  });

  const execute = client.execute;

  const getAppId = async () => {
    const { app } = await client.execute(AppIdQueryDocument);

    return app?.id ?? null;
  };

  return {
    execute,
    getAppId,
  };
};
