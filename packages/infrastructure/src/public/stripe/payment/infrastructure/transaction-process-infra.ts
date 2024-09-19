import { graphqlClient } from "#root/graphql/client";

import { QUERY_PARAMS } from "../consts";
import { TransactionProcessMutationDocument } from "../graphql/mutations/generated";
import {
  isTransactionFailed,
  isTransactionSuccessful,
  parseApiError,
} from "../helpers";
import type { PaymentServiceConfig, TransactionProcessInfra } from "../types";

export const transactionProcessInfra =
  ({ apiURI }: PaymentServiceConfig): TransactionProcessInfra =>
  async ({ searchParams }) => {
    if (searchParams[QUERY_PARAMS.TRANSACTION_ID]) {
      const { data } = await graphqlClient(apiURI).execute(
        TransactionProcessMutationDocument,
        {
          variables: { id: searchParams[QUERY_PARAMS.TRANSACTION_ID] },
        },
      );
      const errors = data?.transactionProcess?.errors ?? [];

      if (errors.length) {
        return {
          isSuccess: false,
          errors: errors.map(parseApiError("transactionProcess")),
        };
      }

      const transactionEvent = data?.transactionProcess?.transactionEvent;

      if (transactionEvent) {
        if (isTransactionFailed(transactionEvent.type)) {
          return {
            isSuccess: false,
            errors: [{ code: transactionEvent.message, type: "stripe" }],
          };
        }

        return {
          errors: [],
          isSuccess: isTransactionSuccessful(
            data?.transactionProcess?.transactionEvent?.type,
          ),
        };
      }
    }

    return { isSuccess: false, errors: [] };
  };
