import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { isTransactionFailed } from "../../helpers";
import type { PaymentServiceConfig } from "../../types";
import { TransactionInitializeMutationDocument } from "../graphql/mutations/generated";
import type { StripePaymentInitializeInfra } from "../types";

type PaymentInitializeData = {
  paymentIntent: {
    clientSecret: string;
    publishableKey: string;
  };
};

export const paymentInitializeTransactionInfra =
  ({
    apiURI,
    gatewayAppId,
    logger,
  }: PaymentServiceConfig): StripePaymentInitializeInfra =>
  async ({
    amount,
    id,
    paymentMethodId,
    saveForFutureUse,
    sharedPaymentToken,
  }) => {
    const result = await graphqlClient(apiURI).execute(
      TransactionInitializeMutationDocument,
      {
        variables: {
          amount,
          id,
          gatewayAppId,
          /**
           * Intent options are named, not passed through: the payment app
           * decides what reaches Stripe.
           */
          data: {
            ...(paymentMethodId && { paymentMethodId }),
            ...(saveForFutureUse && { saveForFutureUse }),
            ...(sharedPaymentToken && { sharedPaymentToken }),
          },
        },
        operationName: "TransactionInitializeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to initialize transaction.", {
        errors: result.errors,
        id,
        amount,
      });

      return err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]);
    }

    if (result.data.transactionInitialize?.errors.length) {
      logger.error("Transaction initialization returned errors", {
        errors: result.data.transactionInitialize.errors,
        id,
        amount,
      });

      return err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]);
    }

    const initialize = result.data.transactionInitialize;

    if (!initialize?.transaction?.id || !initialize.transactionEvent?.id) {
      logger.error("Transaction initialization returned no transaction.", {
        amount,
        id,
      });

      return err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]);
    }

    /**
     * A decline arrives as a failure event, not a mutation error, and carries
     * no session to confirm against.
     */
    if (isTransactionFailed(initialize.transactionEvent.type)) {
      logger.error("Transaction initialization was refused.", {
        amount,
        id,
        message: initialize.transactionEvent.message,
        type: initialize.transactionEvent.type,
      });

      return err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]);
    }

    const { paymentIntent } = (initialize.data ??
      {}) as Partial<PaymentInitializeData>;

    if (!paymentIntent?.clientSecret || !paymentIntent.publishableKey) {
      logger.error("Transaction initialization returned no session data.", {
        amount,
        id,
      });

      return err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]);
    }

    return ok({
      gatewayConfig: { publishableKey: paymentIntent.publishableKey },
      providerData: {
        clientSecret: paymentIntent.clientSecret,
      },
      /**
       * The event id is unique per initialization, so it identifies this
       * session without carrying the client secret around as an id.
       */
      sessionId: initialize.transactionEvent.id,
      transaction: {
        id: initialize.transaction.id,
      },
    });
  };
