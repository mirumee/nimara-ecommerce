import { GraphqlClient } from "#root/graphql/client";
import { Logger } from "#root/logging/types";
import { ok, err } from "@nimara/domain/objects/Result";
import { CheckoutSessionGetDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { StripePaymentService } from "#root/payment/providers";

const DEFAULT_CACHE_TIME = 60 * 60; // 1 hour

export const checkoutSessionCompleteInfra = async ({
  deps,
  input,
}: {
  input: { checkoutSessionId: string };
  deps: {
    paymentService: StripePaymentService;
    graphqlClient: GraphqlClient;
    logger: Logger;
  };
}) => {
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

  const transaction =
    await deps.paymentService.paymentGatewayTransactionInitialize({
      id: result.data.checkout.id,
      amount: result.data.checkout.totalPrice.gross.amount,
      sharedPaymentToken: result.data.checkout.sharedPaymentToken, // TODO
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

  const paymentResult = await deps.paymentService.paymentResultProcess({
    checkout: result.data.checkout,
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
        code: "PAYMENT_NOT_COMPLETED_ERROR",
      },
    ]);
  }

  deps.graphqlClient.execute();

  // Here you can add logic to complete the checkout in Saleor if needed

  return ok({ orderId: input.checkoutSessionId });
};
