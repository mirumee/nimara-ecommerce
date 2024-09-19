import { invariant } from "graphql/jsutils/invariant";

import { graphqlClient } from "#root/graphql/client";

import { PAYMENT_USAGE } from "../consts";
import { TransactionInitializeMutationDocument } from "../graphql/mutations/generated";
import { parseApiError } from "../helpers";
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
    { apiURI, gatewayAppId }: PaymentServiceConfig,
    state: StripeServiceState,
  ): TransactionInitializeInfra =>
  async ({ paymentMethod, customerId, saveForFutureUse, id, amount }) => {
    const { data } = await graphqlClient(apiURI).execute(
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
      },
    );

    const errors = data?.transactionInitialize?.errors ?? [];

    if (errors.length) {
      return {
        errors: errors.map(parseApiError("transactionInitialize")),
        data: null,
      };
    }

    invariant(
      data?.transactionInitialize?.transaction?.id,
      "Unexpected state. Mutation successful but transaction id not returned.",
    );
    invariant(
      data?.transactionInitialize.data,
      "Unexpected state. Mutation successful but transaction data not returned.",
    );

    state.transactionId = data.transactionInitialize.transaction.id;

    return {
      errors: [],
      data: (data?.transactionInitialize?.data as PaymentInitializeData)
        ?.paymentIntent?.clientSecret,
    };
  };
