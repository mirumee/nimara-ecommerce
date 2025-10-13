import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { type GraphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { AcpCheckoutCompleteMutationDocument } from "#root/mcp/saleor/graphql/mutations/generated";
import { CheckoutSessionGetDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { validateAndSerializeCheckout } from "#root/mcp/saleor/serializers";
import {
  type CheckoutSession,
  type CheckoutSessionCompleteSchema,
} from "#root/mcp/schema";
import { type StripePaymentService } from "#root/payment/providers";

export const checkoutSessionCompleteInfra = async ({
  deps,
  input,
}: {
  deps: {
    cacheTime: number;
    graphqlClient: GraphqlClient;
    logger: Logger;
    paymentService: StripePaymentService;
    storefrontUrl: string;
  };
  input: {
    checkoutSessionComplete: CheckoutSessionCompleteSchema;
    checkoutSessionId: string;
  };
}): AsyncResult<{ checkoutSession: CheckoutSession }> => {
  const result = await deps.graphqlClient.execute(CheckoutSessionGetDocument, {
    variables: {
      languageCode: "EN",
      id: input.checkoutSessionId,
    },
    options: {
      next: {
        revalidate: deps.cacheTime,
        tags: [`ACP:CHECKOUT_SESSION:${input.checkoutSessionId}`],
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

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
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
    deps.logger.error(
      "Failed to process payment result for checkout session ${input.checkoutSessionId}.",
      { errors: paymentResult.errors },
    );

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  if (!paymentResult.data.success) {
    deps.logger.error(
      "Payment not completed for checkout session ${input.checkoutSessionId}.",
    );

    return err([
      {
        code: "PAYMENT_EXECUTE_ERROR",
      },
    ]);
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

  // Here you can add logic to complete the checkout in Saleor if needed
  if (!completeResult.ok) {
    deps.logger.error("Failed to complete checkout in Saleor", {
      errors: completeResult.errors,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  if (!completeResult.data.checkoutComplete?.order) {
    deps.logger.error("No order found after completing checkout in Saleor", {
      checkoutId: input.checkoutSessionId,
    });

    return err([
      {
        code: "BAD_REQUEST_ERROR",
      },
    ]);
  }

  const checkoutSession = validateAndSerializeCheckout(result.data.checkout, {
    storefrontUrl: deps.storefrontUrl,
  });

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

  checkoutSession.id = completeResult.data.checkoutComplete?.order?.id; // from now we need to return order id to avability to fetch order details or cancel order

  return ok({
    checkoutSession,
  });
};
