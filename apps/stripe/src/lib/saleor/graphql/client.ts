import { loggingService } from "@nimara/infrastructure/logging/service";

import { graphqlClient } from "@/lib/graphql/client";

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
    logger: loggingService,
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
