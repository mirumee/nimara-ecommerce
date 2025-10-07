import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { CheckoutSessionGetDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { validateAndSerializeCheckout } from "#root/mcp/saleor/serializers";
import { CheckoutSession } from "#root/mcp/schema";
import { AsyncResult, err, ok } from "@nimara/domain/objects/Result";

const DEFAULT_CACHE_TIME = 60 * 60; // 1 hour

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
  const result = await deps.graphqlClient.execute(CheckoutSessionGetDocument, {
    variables: {
      id: input.checkoutSessionId,
    },
    options: {
      next: {
        revalidate: DEFAULT_CACHE_TIME,
        tags: [`MCP_CHECKOUT_SESSION:${input.checkoutSessionId}`],
      },
    },
    operationName: "ACP:CheckoutSessionQuery",
  });

  if (!result.ok) {
    deps.logger.error("Failed to fetch checkout session from Saleor", {
      errors: result.errors,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  if (!result.data.checkout) {
    deps.logger.error("No checkout found in Saleor", {
      checkoutId: input.checkoutSessionId,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  const checkoutSession = validateAndSerializeCheckout(result.data.checkout);

  if (!checkoutSession) {
    deps.logger.error("Failed to parse checkout session from Saleor", {
      checkout: result.data.checkout,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  return ok({
    checkoutSession,
  });
};
