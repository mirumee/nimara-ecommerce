import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { ChannelsQueryDocument } from "#root/apps/saleor/graphql/queries/generated";
import { graphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

export type SaleorChannel = {
  currency: string;
  name: string;
  slug: string;
};

export const fetchSaleorChannels = async ({
  authToken,
  logger,
  saleorUrl,
}: {
  authToken?: string;
  logger?: Logger;
  saleorUrl: string;
}): AsyncResult<SaleorChannel[]> => {
  const client = graphqlClient(`${saleorUrl}/graphql/`, authToken, { logger });
  const result = await client.execute(ChannelsQueryDocument);

  if (!result.ok) {
    return result;
  }

  return ok(
    (result.data.channels ?? []).map(({ currencyCode, name, slug }) => ({
      currency: currencyCode,
      name,
      slug,
    })),
  );
};
