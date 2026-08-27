import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { graphqlClient } from "@nimara/infrastructure/graphql/client";
import { type Logger } from "@nimara/infrastructure/logging/types";
import { saleorUrlFromDomain } from "@nimara/lib/saleor/url";

import { AppIdQueryDocument } from "@/graphql/generated/client";

export const saleorClient =
  ({ logger, timeout }: { logger: Logger; timeout: number }) =>
  ({
    authToken,
    saleorDomain,
  }: {
    authToken?: string;
    saleorDomain: string;
  }) => {
    const client = graphqlClient(
      `${saleorUrlFromDomain(saleorDomain)}/graphql/`,
      authToken,
      { logger, timeout },
    );

    const getAppId = async (): AsyncResult<string | null> => {
      const result = await client.execute(AppIdQueryDocument);

      if (!result.ok) {
        return result;
      }

      return ok(result.data.app?.id ?? null);
    };

    return { execute: client.execute, getAppId };
  };

export type SaleorClient = ReturnType<ReturnType<typeof saleorClient>>;
