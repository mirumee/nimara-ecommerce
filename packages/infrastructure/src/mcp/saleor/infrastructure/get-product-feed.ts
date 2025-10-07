import { GetProductFeedArgs } from "#root/mcp/types";
import { BaseError } from "@nimara/domain/objects/Error";
import { err, ok } from "@nimara/domain/objects/Result";
import { ProductsFeedQueryDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";

export const getProductFeedInfra = async ({
  deps,
  input,
}: {
  deps: { graphqlClient: GraphqlClient; logger: Logger };
  input: GetProductFeedArgs;
}) => {
  const result = await deps.graphqlClient.execute(ProductsFeedQueryDocument, {
    operationName: "ProductsFeedQuery",
    variables: {
      channel: input.channel,
      first: input.limit,
    },
  });

  return ok({
    products: result.data?.products?.edges.map(({ node }) => node) || [],
    pageInfo: {
      type: "cursor",
      after: null,
      before: null,
      hasNextPage: false,
      hasPreviousPage: false,
    } as const,
  });
};
