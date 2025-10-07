import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { CheckoutSession } from "#root/mcp/types";
import { AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { CheckoutQueryDocument } from "../graphql/queries/generated";

export const checkoutSessionGetInfra = async ({
  deps,
  input,
}: {
  deps: {
    graphqlClient: GraphqlClient;
    logger: Logger;
  };
  input: { checkoutSessionId: string };
}): AsyncResult<{ checkoutSession: CheckoutSession }> => {
  const result = await deps.graphqlClient.execute(CheckoutQueryDocument, {
    variables: {
      id: input.checkoutSessionId,
    },
    operationName: "ACP:CheckoutQuery",
  });

  if (!result.ok) {
    console.error(result.errors.join("\n"));
    // TODO: Add proper error handling
    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  if (!result.data.checkout) {
    console.error("No checkout returned from Saleor", {
      id: input.checkoutSessionId,
    });
    // TODO: Add proper error handling
    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  return ok({
    checkoutSession: {
      id: input.checkoutSessionId,
      lineItems: [],
      totalAmount: 0,
    },
  });
};
