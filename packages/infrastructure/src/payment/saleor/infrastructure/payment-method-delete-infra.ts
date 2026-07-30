import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  PaymentMethodDeleteInfra,
  PaymentServiceConfig,
} from "../../types";
import { StoredPaymentMethodRequestDeleteMutationDocument } from "../graphql/mutations/generated";

export const paymentMethodDeleteInfra =
  ({ apiURI, logger }: PaymentServiceConfig): PaymentMethodDeleteInfra =>
  async ({ accessToken, channel, id }) => {
    const result = await graphqlClient(apiURI, accessToken).execute(
      StoredPaymentMethodRequestDeleteMutationDocument,
      {
        variables: { channel, id },
        operationName: "StoredPaymentMethodRequestDeleteMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to delete the payment method.", {
        channel,
        errors: result.errors,
        id,
      });

      return result;
    }

    const deleteResult = result.data.storedPaymentMethodRequestDelete;
    const errors = deleteResult?.errors ?? [];

    if (errors.length || deleteResult?.result !== "SUCCESSFULLY_DELETED") {
      logger.error("Payment method deletion was rejected.", {
        channel,
        errors,
        id,
        result: deleteResult?.result,
      });

      return err([{ code: "PAYMENT_METHOD_DELETE_ERROR" }]);
    }

    return ok({ success: true });
  };
