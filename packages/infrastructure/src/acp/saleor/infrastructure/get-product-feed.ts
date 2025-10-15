import { ok } from "@nimara/domain/objects/Result";

import { ProductsFeedQueryDocument } from "#root/acp/saleor/graphql/queries/generated";
import { type ProductFeed } from "#root/acp/schema";
import { type ACPResponse, type GetProductFeedArgs } from "#root/acp/types";
import { type PageInfo } from "#root/collection/types";
import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

import { validateAndSerializeProducts } from "../serializers";

export const getProductFeedInfra = async ({
  deps,
  input,
}: {
  deps: {
    cacheTTL: number;
    graphqlClient: GraphqlClient;
    logger: Logger;
    storefrontUrl: string;
  };
  input: GetProductFeedArgs;
}): ACPResponse<{ pageInfo: PageInfo; products: ProductFeed }> => {
  const result = await deps.graphqlClient.execute(ProductsFeedQueryDocument, {
    operationName: "ACP:ProductsFeedQuery",
    variables: {
      channel: input.channel,
      first: input.limit,
    },
    options: {
      next: {
        revalidate: deps.cacheTTL,
        tags: [`ACP:PRODUCT_FEED:${input.channel}`],
      },
    },
  });

  if (!result.ok) {
    deps.logger.error("Failed to fetch product feed from Saleor", {
      errors: result.errors,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to fetch product feed.",
        param: "channel",
      },
    };
  }

  const saleorProducts =
    result.data.products?.edges.map(({ node }) => node) ?? [];

  if (saleorProducts.length === 0) {
    deps.logger.warning("No products found in product feed", {
      channel: input.channel,
      first: input.limit,
    });

    return ok({
      products: [],
      pageInfo: {
        type: "cursor",
        after: null,
        before: null,
        hasNextPage: false,
        hasPreviousPage: false,
      } as const,
    });
  }

  const feedItems = validateAndSerializeProducts(saleorProducts, {
    logger: deps.logger,
    channelPrefix: input.channelPrefix,
    storefrontUrl: deps.storefrontUrl,
  });

  return ok({
    products: feedItems,
    pageInfo: {
      type: "cursor",
      after: null,
      before: null,
      hasNextPage: false,
      hasPreviousPage: false,
    } as const,
  });
};
