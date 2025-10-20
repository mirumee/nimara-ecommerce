import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { ok } from "@nimara/domain/objects/Result";

import { AcpCheckoutCompleteMutationDocument } from "#root/acp/saleor/graphql/mutations/generated";
import { CheckoutSessionGetDocument } from "#root/acp/saleor/graphql/queries/generated";
import { validateAndSerializeCheckout } from "#root/acp/saleor/serializers";
import {
  type CheckoutSession,
  type CheckoutSessionCompleteSchema,
} from "#root/acp/schema";
import { type ACPResponse } from "#root/acp/types";
import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { type StripePaymentService } from "#root/payment/providers";

export const checkoutSessionCompleteInfra = async ({
  deps,
  input,
}: {
  deps: {
    cacheTTL: number;
    graphqlClient: GraphqlClient;
    languageCode: LanguageCodeEnum;
    logger: Logger;
    paymentService: StripePaymentService;
    storefrontUrl: string;
  };
  input: {
    checkoutSessionComplete: CheckoutSessionCompleteSchema;
    checkoutSessionId: string;
  };
}): ACPResponse<CheckoutSession> => {
  const result = await deps.graphqlClient.execute(CheckoutSessionGetDocument, {
    variables: {
      languageCode: deps.languageCode,
      id: input.checkoutSessionId,
    },
    options: {
      next: {
        revalidate: deps.cacheTTL,
        tags: [`ACP:CHECKOUT_SESSION:${input.checkoutSessionId}`],
      },
    },
    operationName: "ACP:CheckoutSessionQuery",
  });

  if (!result.ok) {
    deps.logger.error("Failed to fetch checkout session from Saleor", {
      errors: result.errors,
    });

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "Failed to fetch checkout session from database",
        type: "invalid_request",
        param: "",
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
        code: "request_not_idempotent",
        message: "No checkout found in database",
        type: "invalid_request",
        param: "",
      },
    };
  }

  const transaction =
    await deps.paymentService.paymentGatewayTransactionInitialize({
      id: result.data.checkout.id,
      amount: result.data.checkout.totalPrice.gross.amount,
      sharedPaymentToken: input.checkoutSessionComplete.payment_data.token,
    });

  if (!transaction) {
    deps.logger.error(
      "Failed to initialize payment transaction for checkout session ${input.checkoutSessionId}.",
    );

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "Failed to initialize payment transaction",
        type: "invalid_request",
        param: "",
      },
    };
  }

  const transactionId = transaction.data?.transactionId;

  // Map Saleor checkout to domain Checkout type
  const mapSaleorCheckoutToDomain = (saleorCheckout: any): Checkout => ({
    ...saleorCheckout,
    billingAddress: saleorCheckout.billingAddress
      ? {
          ...saleorCheckout.billingAddress,
          country: saleorCheckout.billingAddress.country.code, // Ensure country is a string code
        }
      : null,
    shippingAddress: saleorCheckout.shippingAddress
      ? {
          ...saleorCheckout.shippingAddress,
          country: saleorCheckout.shippingAddress.country.code,
        }
      : null,
  });

  const domainCheckout = mapSaleorCheckoutToDomain(result.data.checkout);

  const paymentResult = await deps.paymentService.paymentResultProcess({
    checkout: domainCheckout,
    searchParams: { transactionId: transactionId! },
  });

  if (!paymentResult.ok) {
    deps.logger.critical(
      "Unexpected error occurred while processing payment.",
      {
        checkoutSessionId: input.checkoutSessionId,
        errors: paymentResult.errors,
      },
    );

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "Failed to complete payment. Payment processing error.",
        type: "invalid_request",
        param: "",
      },
    };
  }

  if (!paymentResult.data.success) {
    deps.logger.critical("Failed to complete payment for checkout session.", {
      checkoutSessionId: input.checkoutSessionId,
    });

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "Failed to complete payment. Payment was not successful.",
        type: "invalid_request",
        param: "",
      },
    };
  }

  const completeResult = await deps.graphqlClient.execute(
    AcpCheckoutCompleteMutationDocument,
    {
      variables: {
        id: input.checkoutSessionId,
      },
      operationName: "ACP:CheckoutCompleteMutation",
    },
  );

  if (!completeResult.ok) {
    deps.logger.error("Failed to complete checkout in Saleor", {
      errors: completeResult.errors,
    });

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "Failed to complete checkout in database",
        type: "invalid_request",
        param: "",
      },
    };
  }

  if (!completeResult.data.checkoutComplete?.order) {
    deps.logger.error("No order found after completing checkout in Saleor", {
      checkoutId: input.checkoutSessionId,
    });

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "No order found after completing checkout in database",
        type: "invalid_request",
        param: "",
      },
    };
  }

  const checkoutSession = validateAndSerializeCheckout(result.data.checkout, {
    storefrontUrl: deps.storefrontUrl,
  });

  if (!checkoutSession) {
    deps.logger.error("Failed to parse checkout session from Saleor", {
      checkout: result.data.checkout,
    });

    return {
      ok: false,
      error: {
        code: "request_not_idempotent",
        message: "Failed to parse checkout session from database",
        type: "invalid_request",
        param: "",
      },
    };
  }

  checkoutSession.id = completeResult.data.checkoutComplete?.order?.id; // from now we need to return order id to availability to fetch order details or cancel order

  return ok(checkoutSession);
};
