import { type WebhookData } from "@nimara/infrastructure/apps/saleor/schemas";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { getAmountFromCents, getCentsFromAmount } from "@/domain/currency";
import {
  type PaymentGroupRequest,
  type TransactionEventSchema,
} from "@/domain/payment";
import { type TransactionInitializeSessionSubscription } from "@/graphql/generated/client";

import { transactionEventResponse } from "./helpers";

/**
 * Several checkouts paid with one PaymentIntent. Followers only register a
 * transaction without a PaymentIntent; the leader creates the shared intent
 * once every follower is registered, so nothing can be paid earlier.
 */
export const paymentGroupInitializeResponse = ({
  event,
  logger,
  paymentGroup,
  saleorDomain,
}: {
  event: WebhookData<TransactionInitializeSessionSubscription>;
  logger: Logger;
  paymentGroup: PaymentGroupRequest | undefined;
  saleorDomain: string;
}): Response => {
  const total = event.sourceObject.total.gross;
  const totalCents = getCentsFromAmount(total);
  const amount = getAmountFromCents({
    amount: totalCents,
    currency: total.currency,
  });

  const respond = (data: TransactionEventSchema) =>
    transactionEventResponse({
      data,
      logger,
      type: "TransactionInitializeSession",
    });

  const refuse = (message: string) => {
    logger.warning("Group payment refused.", {
      message,
      saleorDomain,
      transactionId: event.transaction.id,
    });

    return respond({
      amount,
      message,
      result: `${event.action.actionType}_FAILURE`,
    });
  };

  if (!paymentGroup) {
    return refuse("Invalid payment group.");
  }

  if (event.action.actionType !== "CHARGE") {
    return refuse("Group payments support charge only.");
  }

  if (
    event.action.currency !== total.currency ||
    getCentsFromAmount(event.action) !== totalCents
  ) {
    return refuse("Payment amount does not match the checkout total.");
  }

  if (paymentGroup.role === "leader") {
    return refuse("Group payment leader is not supported.");
  }

  return respond({ amount, result: "CHARGE_ACTION_REQUIRED" });
};
