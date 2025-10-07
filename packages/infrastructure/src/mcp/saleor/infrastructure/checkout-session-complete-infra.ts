import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { ok } from "@nimara/domain/objects/Result";

export const checkoutSessionCompleteInfra = async ({
  input,
}: {
  input: { checkoutSessionId: string };
  deps: {
    graphqlClient: GraphqlClient;
    logger: Logger;
  };
}) => {
  return ok({ orderId: input.checkoutSessionId });
};
