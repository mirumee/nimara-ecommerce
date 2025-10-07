import { GetProductFeedArgs } from "#root/mcp/types";
import { ok } from "@nimara/domain/objects/Result";

export const getProductFeedInfra = async (args: GetProductFeedArgs) => {
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
};
