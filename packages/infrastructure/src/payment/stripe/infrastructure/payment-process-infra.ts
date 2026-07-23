import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import {
  isTransactionActionRequired,
  isTransactionSuccessful,
} from "../../helpers";
import type { PaymentServiceConfig } from "../../types";
import { TransactionProcessMutationDocument } from "../graphql/mutations/generated";
import type { PaymentProcessInfra } from "../types";

export const paymentProcessInfra =
  ({ apiURI, logger }: PaymentServiceConfig): PaymentProcessInfra =>
  async ({ data, transaction }) => {
    const result = await graphqlClient(apiURI).execute(
      TransactionProcessMutationDocument,
      {
        variables: { id: transaction.id, data },
        options: {
          cache: "no-store",
        },
        operationName: "TransactionProcessMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to process transaction.", {
        errors: result.errors,
        transactionId: transaction.id,
      });

      return err([{ code: "TRANSACTION_PROCESS_ERROR" }]);
    }

    if (result.data.transactionProcess?.errors.length) {
      logger.error("Transaction process returned errors.", {
        errors: result.data.transactionProcess.errors,
        transactionId: transaction.id,
      });

      return err([{ code: "TRANSACTION_PROCESS_ERROR" }]);
    }

    const orderId = result.data.transactionProcess?.transaction?.order?.id;
    const eventType = result.data.transactionProcess?.transactionEvent?.type;

    /** Saleor already completed the checkout — the order is ready. */
    if (orderId) {
      return ok({ actionRequired: false, orderId });
    }

    if (isTransactionSuccessful(eventType)) {
      return ok({ actionRequired: false });
    }

    if (isTransactionActionRequired(eventType)) {
      return ok({ actionRequired: true });
    }

    logger.error("Transaction process ended in an unexpected state.", {
      eventType: eventType ?? null,
      transactionId: transaction.id,
    });

    return err([{ code: "TRANSACTION_PROCESS_ERROR" }]);
  };
