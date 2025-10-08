import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { CheckoutSessionCreateDocument } from "#root/mcp/saleor/graphql/mutations/generated";
import { validateAndSerializeCheckout } from "#root/mcp/saleor/serializers";
import {
  type CheckoutSession,
  type CheckoutSessionCreateSchema,
} from "#root/mcp/schema";

export const checkoutSessionCreateInfra = async ({
  deps,
  input,
}: {
  deps: {
    channel: string;
    graphqlClient: GraphqlClient;
    logger: Logger;
    storefrontUrl: string;
  };
  input: CheckoutSessionCreateSchema;
}): AsyncResult<{ checkoutSession: CheckoutSession }> => {
  const result = await deps.graphqlClient.execute(
    CheckoutSessionCreateDocument,
    {
      variables: {
        input: {
          channel: deps.channel,
          lines: input.items.map((item) => ({
            quantity: item.quantity,
            variantId: item.id,
          })),
        },
      },
      operationName: "ACP:CheckoutCreateMutation",
    },
  );

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

  const checkout = validateAndSerializeCheckout(
    result.data.checkoutCreate.checkout,
    {
      storefrontUrl: deps.storefrontUrl,
    },
  );

  if (!checkout) {
    console.error("Failed to parse created checkout", {
      checkout: result.data.checkoutCreate.checkout,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  return ok({ checkoutSession: checkout });
};
