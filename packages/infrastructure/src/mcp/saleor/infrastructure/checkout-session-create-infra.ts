import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { CheckoutSessionCreateDocument } from "#root/mcp/saleor/graphql/mutations/generated";
import { validateAndSerializeCheckout } from "#root/mcp/saleor/serializers";
import {
  type CheckoutSession,
  type CheckoutSessionCreateSchema,
} from "#root/mcp/schema";

const DEFAULT_LANGUAGE = "EN";

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
        languageCode: DEFAULT_LANGUAGE,
      },
      operationName: "ACP:CheckoutCreateMutation",
    },
  );

  if (!result.ok) {
    deps.logger.error("Failed to create checkout session in Saleor", {
      errors: result.errors,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  if (!result.data.checkoutCreate?.checkout) {
    deps.logger.error("No checkout created");

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
    deps.logger.error("Failed to parse created checkout", {
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
