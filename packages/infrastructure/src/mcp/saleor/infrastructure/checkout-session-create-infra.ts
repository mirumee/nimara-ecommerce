import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { CheckoutCreateDocument } from "#root/mcp/saleor/graphql/mutations/generated";
import { CheckoutSession, CheckoutSessionCreateInput } from "#root/mcp/types";
import { AsyncResult, err, ok } from "@nimara/domain/objects/Result";

export const checkoutSessionCreateInfra = async ({
  deps,
  input,
}: {
  deps: {
    graphqlClient: GraphqlClient;
    logger: Logger;
  };
  input: CheckoutSessionCreateInput;
}): AsyncResult<{ checkoutSession: CheckoutSession }> => {
  const result = await deps.graphqlClient.execute(CheckoutCreateDocument, {
    variables: {
      input: {
        lines: input.items.map((item) => ({
          quantity: item.quantity,
          variantId: item.id,
        })),
      },
    },
    operationName: "ACP:CheckoutCreateMutation",
  });

  if (!result.ok) {
    console.error(result.errors.join("\n"));
    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  if (!result.data.checkoutCreate?.checkout) {
    console.error("No checkout created");
    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  return ok({
    checkoutSession: {
      id: result.data.checkoutCreate.checkout.id,
      lineItems: [],
      totalAmount: 0,
    },
  });
};
