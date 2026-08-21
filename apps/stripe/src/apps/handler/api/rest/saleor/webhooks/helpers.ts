import { type Logger } from "@nimara/infrastructure/logging/types";

import { container } from "@/container";
import { type PaymentGatewayConfig } from "@/domain/app-config";
import {
  type PaymentIntent,
  type TransactionFlowStrategy,
} from "@/domain/consts";
import {
  buildGatewayMetadata,
  getIntentDashboardUrl,
  mapStatusToActionType,
} from "@/domain/event-mapping";
import {
  type TransactionEventSchema,
  transactionEventSchema,
} from "@/domain/payment";
import { responseError, responseFromErrors } from "@/lib/api/util";
import { getAmountFromCents } from "@/lib/currency";

/**
 * Serializes a transaction event handler result into the synchronous
 * webhook response Saleor expects.
 */
export const transactionEventResponse = ({
  data,
  logger,
  type,
}: {
  data: TransactionEventSchema;
  logger: Logger;
  type: string;
}): Response => {
  const eventResult = transactionEventSchema.safeParse(data);

  if (!eventResult.success) {
    const message = `Failed to construct ${type} event response.`;

    logger.error(message, { errors: eventResult.error.issues });

    return responseError({
      description: message,
      errors: eventResult.error.issues,
      status: 422,
    });
  }

  logger.debug(`Constructed ${type} event response.`, { eventResult });

  return Response.json(transactionEventSchema.parse(eventResult.data));
};

export const missingSourceObjectResponse = ({ type }: { type: string }) =>
  responseFromErrors([
    {
      code: "TRANSACTION_ERROR",
      message: `Missing source object information for ${type}.`,
      status: 422,
    },
  ]);

export const sessionMetadata = ({
  channelSlug,
  extraMetadata,
  saleorDomain,
  transactionId,
}: {
  channelSlug: string;
  extraMetadata?: Record<string, string>;
  saleorDomain: string;
  transactionId: string;
}) => {
  const config = container.get("config");

  return buildGatewayMetadata({
    appId: config.APP_ID,
    environment: config.ENVIRONMENT,
    metadata: { saleorDomain, transactionId, channelSlug, ...extraMetadata },
  });
};

// Session response — full payment-intent payload for the storefront SDK.
export const intentResponse = ({
  actionType,
  config,
  intent,
}: {
  actionType: TransactionFlowStrategy;
  config: PaymentGatewayConfig;
  intent: PaymentIntent;
}): TransactionEventSchema => ({
  pspReference: intent.id,
  result: mapStatusToActionType({ actionType, status: intent.status }),
  amount: getAmountFromCents({
    currency: intent.currency,
    amount: intent.amount,
  }),
  message: intent.lastErrorCode,
  data: {
    paymentIntent: {
      clientSecret: intent.clientSecret,
      publishableKey: config.publicKey,
      time: intent.created,
      externalUrl: getIntentDashboardUrl({
        paymentId: intent.id,
        secretKey: config.secretKey,
      }),
    },
  },
});

// Terminal charge/cancel/refund response — amounts plus the dashboard link.
export const finalizedResponse = ({
  config,
  intent,
  result,
}: {
  config: PaymentGatewayConfig;
  intent: PaymentIntent;
  result: TransactionEventSchema["result"];
}): TransactionEventSchema => ({
  pspReference: intent.id,
  result,
  amount: getAmountFromCents({
    currency: intent.currency,
    amount: intent.amount,
  }),
  externalUrl: getIntentDashboardUrl({
    paymentId: intent.id,
    secretKey: config.secretKey,
  }),
});
