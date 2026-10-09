import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { isTransactionFailed } from "../../helpers";
import type {
  PaymentGroupFollowerInitializeInfra,
  PaymentServiceConfig,
} from "../../types";
import { TransactionInitializeMutationDocument } from "../graphql/mutations/generated";
import type { StripePaymentGroupLeaderInitializeInfra } from "../types";

type PaymentInitializeData = {
  paymentIntent: {
    clientSecret: string;
    publishableKey: string;
  };
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const initializeGroupTransaction = async ({
  amount,
  apiURI,
  data,
  gatewayAppId,
  id,
  idempotencyKey,
  logger,
}: PaymentServiceConfig & {
  amount: number;
  data: unknown;
  id: string;
  idempotencyKey: string;
}) => {
  const result = await graphqlClient(apiURI).execute(
    TransactionInitializeMutationDocument,
    {
      variables: { amount, data, gatewayAppId, id, idempotencyKey },
      operationName: "TransactionInitializeMutation",
    },
  );

  if (!result.ok) {
    logger.error("Failed to initialize a payment group transaction.", {
      amount,
      errors: result.errors,
      id,
    });

    return err([{ code: "TRANSACTION_INITIALIZE_ERROR" as const }]);
  }

  const initialize = result.data.transactionInitialize;

  if (initialize?.errors.length) {
    logger.error("Payment group transaction initialization returned errors.", {
      amount,
      errors: initialize.errors,
      id,
    });

    return err([{ code: "TRANSACTION_INITIALIZE_ERROR" as const }]);
  }

  if (!initialize?.transaction?.id || !initialize.transactionEvent?.id) {
    logger.error("Payment group initialization returned no transaction.", {
      amount,
      id,
    });

    return err([{ code: "TRANSACTION_INITIALIZE_ERROR" as const }]);
  }

  if (isTransactionFailed(initialize.transactionEvent.type)) {
    logger.error("Payment group transaction was refused.", {
      amount,
      id,
      message: initialize.transactionEvent.message,
      type: initialize.transactionEvent.type,
    });

    return err([{ code: "TRANSACTION_INITIALIZE_ERROR" as const }]);
  }

  return ok({
    data: initialize.data,
    eventId: initialize.transactionEvent.id,
    transactionId: initialize.transaction.id,
  });
};

export const paymentGroupFollowerInitializeInfra =
  (config: PaymentServiceConfig): PaymentGroupFollowerInitializeInfra =>
  async ({ amount, id }) => {
    const result = await initializeGroupTransaction({
      ...config,
      amount,
      data: { paymentGroup: { role: "follower" } },
      id,
      idempotencyKey: `payment-group-follower-${await sha256(`${id}|${amount}`)}`,
    });

    return result.ok ? ok({ id: result.data.transactionId }) : result;
  };

export const paymentGroupLeaderInitializeInfra =
  (config: PaymentServiceConfig): StripePaymentGroupLeaderInitializeInfra =>
  async ({ amount, followers, id, saveForFutureUse }) => {
    const followerTransactionIds = followers
      .map(({ transactionId }) => transactionId)
      .sort()
      .join(",");
    const result = await initializeGroupTransaction({
      ...config,
      amount,
      data: {
        paymentGroup: { role: "leader", followers },
        ...(saveForFutureUse && { saveForFutureUse }),
      },
      id,
      idempotencyKey: `payment-group-leader-${await sha256(
        `${id}|${amount}|${followerTransactionIds}|${saveForFutureUse ? "save" : ""}`,
      )}`,
    });

    if (!result.ok) {
      return result;
    }

    const { paymentIntent } = (result.data.data ??
      {}) as Partial<PaymentInitializeData>;

    if (!paymentIntent?.clientSecret || !paymentIntent.publishableKey) {
      config.logger.error("Payment group leader returned no session data.", {
        amount,
        id,
      });

      return err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]);
    }

    return ok({
      gatewayConfig: { publishableKey: paymentIntent.publishableKey },
      providerData: { clientSecret: paymentIntent.clientSecret },
      sessionId: result.data.eventId,
      transaction: { id: result.data.transactionId },
    });
  };
