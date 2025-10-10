import { type AsyncResult, err } from "@nimara/domain/objects/Result";

import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { type CheckoutSession } from "#root/mcp/schema";

export const checkoutSessionUpdateInfra = async (_params: {
  deps: {
    graphqlClient: GraphqlClient;
    logger: Logger;
  };
  input: { checkoutSessionId: string };
}): AsyncResult<{ checkoutSession: CheckoutSession }> => {
  return err([
    {
      code: "BAD_REQUEST_ERROR",
      message: "Checkout session update is not implemented",
    },
  ]);
};
