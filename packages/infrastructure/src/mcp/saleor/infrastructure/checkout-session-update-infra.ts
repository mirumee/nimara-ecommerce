import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { CheckoutSession } from "#root/mcp/schema";
import { AsyncResult, err, ok } from "@nimara/domain/objects/Result";

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
