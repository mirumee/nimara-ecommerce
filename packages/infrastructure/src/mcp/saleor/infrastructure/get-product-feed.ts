import { ok } from "@nimara/domain/objects/Result";

import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { ProductsFeedQueryDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { type GetProductFeedArgs } from "#root/mcp/types";

import { serializeSaleorProductsToFeedItems } from "../serializers";

export const getProductFeedInfra = async ({
  deps,
  input,
}: {
  deps: { graphqlClient: GraphqlClient; logger: Logger; storefrontUrl: string };
  input: GetProductFeedArgs;
}) => {
  const result = await deps.graphqlClient.execute(ProductsFeedQueryDocument, {
    operationName: "ProductsFeedQuery",
    variables: {
      channel: input.channel,
      first: input.limit,
    },
  });

  const products = serializeSaleorProductsToFeedItems(
    input.channelPrefix,
    deps.storefrontUrl,
    (result.data?.products?.edges || []).map(({ node }) => node),
  );

  return ok({
    products,
    pageInfo: {
      type: "cursor",
      after: null,
      before: null,
      hasNextPage: false,
      hasPreviousPage: false,
    } as const,
  });
};
