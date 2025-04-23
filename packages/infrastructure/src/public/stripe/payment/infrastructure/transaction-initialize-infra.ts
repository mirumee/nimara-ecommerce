import { invariant } from "graphql/jsutils/invariant";

import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { PAYMENT_USAGE } from "../consts";
import { TransactionInitializeMutationDocument } from "../graphql/mutations/generated";
import type {
  PaymentServiceConfig,
  StripeServiceState,
  TransactionInitializeInfra,
} from "../types";

type PaymentInitializeData = {
  paymentIntent: {
    clientSecret: string;
    publishableKey: string;
  };
};

export const transactionInitializeInfra =
  (
    { apiURI, gatewayAppId, logger }: PaymentServiceConfig,
    state: StripeServiceState,
  ): TransactionInitializeInfra =>
  async ({ paymentMethod, customerId, saveForFutureUse, id, amount }) => {
    const result = await graphqlClientV2(apiURI).execute(
      TransactionInitializeMutationDocument,
      {
        variables: {
          amount,
          id,
          gatewayAppId,
          data: {
            automatic_payment_methods: {
              enabled: true,
            },
            ...(customerId && { customer: customerId }),
            ...(paymentMethod && { payment_method: paymentMethod }),
            ...(saveForFutureUse && { setup_future_usage: PAYMENT_USAGE }),
          },
        },
        options: {
          cache: "no-store",
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

      return err([
        {
          code: "TRANSACTION_INITIALIZE_ERROR",
        },
      ]);
    }

    invariant(
      result.data.transactionInitialize?.transaction?.id,
      "Unexpected state. Mutation successful but transaction id not returned.",
    );
    invariant(
      result.data.transactionInitialize.data,
      "Unexpected state. Mutation successful but transaction data not returned.",
    );

    state.transactionId = result.data.transactionInitialize.transaction.id;

    return ok({
      clientSecret: (
        result.data.transactionInitialize.data as PaymentInitializeData
      ).paymentIntent.clientSecret,
    });
  };
