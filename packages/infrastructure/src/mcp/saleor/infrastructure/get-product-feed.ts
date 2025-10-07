import { GetProductFeedArgs } from "#root/mcp/types";
import { BaseError } from "@nimara/domain/objects/Error";
import { err, ok } from "@nimara/domain/objects/Result";
import { graphqlClient } from "#root/graphql/client";
import { ProductsFeedQueryDocument } from "#root/search/saleor/graphql/queries/generated";

export const getProductFeedInfra = async (args: GetProductFeedArgs) => {
  const apiURL = process.env.NEXT_PUBLIC_SALEOR_API_URL!;

  const client = graphqlClient(apiURL);

  const result = await client.execute(ProductsFeedQueryDocument, {
    operationName: "ProductsFeedQuery",
    variables: {
      channel: args.channel,
      first: args.limit,
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
