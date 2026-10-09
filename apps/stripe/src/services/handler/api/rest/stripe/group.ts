import { type Logger } from "@nimara/infrastructure/logging/types";
import { responseFromErrors, responseSuccess } from "@nimara/lib/hono/api/util";

import {
  type StripeNotification,
  type TransactionEventType,
} from "@/domain/consts";
import { getAmountFromCents } from "@/domain/currency";
import { getIntentDashboardUrl } from "@/domain/event-mapping";
import {
  getGroupShareAvailableActions,
  isGroupShareEventType,
  parseGroupShares,
  sumGroupShares,
} from "@/domain/payment-group";
import { type SaleorClient } from "@/infrastructure/saleor/client";

export const reportGroupShares = async ({
  eventType,
  logger,
  notification,
  saleorClient,
  secretKey,
}: {
  eventType: TransactionEventType;
  logger: Logger;
  notification: StripeNotification;
  saleorClient: SaleorClient;
  secretKey: string;
}) => {
  if (!isGroupShareEventType(eventType)) {
    logger.info("Group payment event type is not reported, skipping.", {
      id: notification.id,
      type: notification.type,
    });

    return responseSuccess({ description: "Skipped." });
  }

  const shares = parseGroupShares(notification.metadata);

  if (!shares) {
    logger.error("Group payment metadata is malformed.", {
      id: notification.id,
      paymentIntentId: notification.objectId,
    });

    return responseSuccess({ description: "Skipped." });
  }

  if (sumGroupShares(shares) !== notification.amount) {
    logger.error("Group payment shares do not add up to the event amount.", {
      amount: notification.amount,
      id: notification.id,
      paymentIntentId: notification.objectId,
      sharesTotal: sumGroupShares(shares),
    });

    return responseSuccess({ description: "Skipped." });
  }

  const results = await Promise.all(
    shares.map(async (share) => ({
      share,
      result: await saleorClient.transactionReport({
        transactionId: share.transactionId,
        paymentMethodDetails: notification.paymentMethodDetails,
        // @ts-expect-error: decimal must be a string
        amount: getAmountFromCents({
          currency: notification.currency,
          amount: share.amount,
        }),
        message: notification.lastErrorCode,
        externalUrl: getIntentDashboardUrl({
          paymentId: notification.objectId,
          secretKey,
        }),
        pspReference: notification.objectId,
        time: new Date().toISOString(),
        type: eventType,
        availableActions: getGroupShareAvailableActions(eventType),
      }),
    })),
  );

  results.forEach(({ result, share }) => {
    const errors = result.ok ? (result.data?.errors ?? []) : result.errors;

    if (errors.length) {
      logger.error("Failed to report a group payment share to Saleor.", {
        errors,
        paymentIntentId: notification.objectId,
        transactionId: share.transactionId,
      });
    }
  });

  const transportFailure = results.find(({ result }) => !result.ok)?.result;

  if (transportFailure && !transportFailure.ok) {
    return responseFromErrors(transportFailure.errors);
  }

  return responseSuccess({ description: "Processed." });
};
