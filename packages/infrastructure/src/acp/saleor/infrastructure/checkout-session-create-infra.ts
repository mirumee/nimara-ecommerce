import { CheckoutSessionCreateDocument } from "#root/acp/saleor/graphql/mutations/generated";
import { validateAndSerializeCheckout } from "#root/acp/saleor/serializers";
import { type CheckoutSessionCreateSchema } from "#root/acp/schema";
import { type ACPResponse } from "#root/acp/types";
import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

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
}): ACPResponse => {
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
      options: {
        cache: "no-store",
      },
    },
  );

  if (!result.ok) {
    deps.logger.error("Failed to create checkout session in Saleor", {
      errors: result.errors,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to create checkout session.",
        param: "items",
      },
    };
  }

  if (!result.data.checkoutCreate?.checkout) {
    deps.logger.error("No checkout created");

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          result.data.checkoutCreate?.errors.map((e) => e.message).join(", ") ||
          "Failed to create checkout session.",
        param: "items",
      },
    };
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

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to parse created checkout.",
        param: "items",
      },
    };
  }

  return { ok: true, data: checkout };
};
