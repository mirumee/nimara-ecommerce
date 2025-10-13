import { type LanguageCodeEnum } from "@nimara/codegen/schema";

import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { CheckoutSessionGetDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { validateAndSerializeCheckout } from "#root/mcp/saleor/serializers";
import { type ACPResponse } from "#root/mcp/types";

export const checkoutSessionGetInfra = async ({
  deps,
  input,
}: {
  deps: {
    cacheTime: number;
    languageCode: LanguageCodeEnum;
    graphqlClient: GraphqlClient;
    logger: Logger;
    storefrontUrl: string;
  };
  input: { checkoutSessionId: string };
}): ACPResponse => {
  const result = await deps.graphqlClient.execute(CheckoutSessionGetDocument, {
    variables: {
      id: input.checkoutSessionId,
      languageCode: deps.languageCode,
    },
    options: {
      next: {
        revalidate: deps.cacheTime,
        tags: [`ACP:CHECKOUT_SESSION:${input.checkoutSessionId}`],
      },
    },
    operationName: "ACP:CheckoutSessionGetDocumentMutation",
  });

  if (!result.ok) {
    deps.logger.error("Failed to fetch checkout session from Saleor", {
      errors: result.errors,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to fetch checkout session.",
        param: "checkoutSessionId",
      },
    };
  }

  if (!result.data.checkout) {
    deps.logger.error("No checkout found in Saleor", {
      checkoutId: input.checkoutSessionId,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "No checkout found.",
        param: "checkoutSessionId",
      },
    };
  }

  const checkoutSession = validateAndSerializeCheckout(result.data.checkout, {
    storefrontUrl: deps.storefrontUrl,
  });

  if (!checkoutSession) {
    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to serialize checkout session.",
        param: "checkoutSessionId",
      },
    };
  }

  return { ok: true, data: checkoutSession };
};
