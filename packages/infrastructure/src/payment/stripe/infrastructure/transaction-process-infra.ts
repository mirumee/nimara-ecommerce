import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { QUERY_PARAMS } from "../../consts";
import { isTransactionFailed, isTransactionSuccessful } from "../../helpers";
import type {
  PaymentServiceConfig,
  TransactionProcessInfra,
} from "../../types";
import { TransactionProcessMutationDocument } from "../graphql/mutations/generated";

export const transactionProcessInfra =
  ({ apiURI, logger }: PaymentServiceConfig): TransactionProcessInfra =>
  async ({ searchParams }) => {
    if (searchParams[QUERY_PARAMS.TRANSACTION_ID]) {
      const transactionId = searchParams[QUERY_PARAMS.TRANSACTION_ID];

      const result = await graphqlClient(apiURI).execute(
        TransactionProcessMutationDocument,
        {
          variables: { id: transactionId },
          operationName: "TransactionProcessMutation",
        },
      );

      if (!result.ok) {
        logger.error("Failed to process transaction.", {
          errors: result.errors,
          transactionId,
        });

        return err([
          {
            code: "TRANSACTION_PROCESS_ERROR",
          },
        ]);
      }

      if (result.data?.transactionProcess?.errors.length) {
        logger.error("Transaction process returned errors", {
          errors: result.data.transactionProcess.errors,
          transactionId,
        });

        return err([
          {
            code: "TRANSACTION_PROCESS_ERROR",
          },
        ]);
      }

      const transactionEvent =
        result.data?.transactionProcess?.transactionEvent;

      const eventType = transactionEvent?.type;

      if (transactionEvent) {
        if (isTransactionFailed(eventType)) {
          logger.error("Transaction process failed", {
            eventType: eventType,
          });

          return err([
            {
              code: "TRANSACTION_PROCESS_ERROR",
            },
          ]);
        }

        return ok({
          success: isTransactionSuccessful(eventType),
        });
      }
    }

    return ok({ success: true });
  };
