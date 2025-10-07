import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { CheckoutSession } from "#root/mcp/types";
import { AsyncResult, ok } from "@nimara/domain/objects/Result";

export const checkoutSessionUpdateInfra = async ({
  deps,
  input,
}: {
  deps: {
    graphqlClient: GraphqlClient;
    logger: Logger;
  };
  input: { checkoutSessionId: string };
}): AsyncResult<{ checkoutSession: CheckoutSession }> => {
  return ok({
    checkoutSession: {
      id: input.checkoutSessionId,
      lineItems: [],
      totalAmount: 0,
    },
  });
};
