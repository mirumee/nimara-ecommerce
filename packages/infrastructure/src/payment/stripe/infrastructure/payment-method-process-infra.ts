import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { PaymentMethodProcessTokenizationMutationDocument } from "../../saleor/graphql/mutations/generated";
import type {
  PaymentMethodProcessInfra,
  PaymentServiceConfig,
} from "../../types";

export const paymentMethodProcessInfra =
  ({ apiURI, logger }: PaymentServiceConfig): PaymentMethodProcessInfra =>
  async ({ accessToken, channel, data, id }) => {
    const result = await graphqlClient(apiURI, accessToken).execute(
      PaymentMethodProcessTokenizationMutationDocument,
      {
        variables: { channel, data, id },
        operationName: "PaymentMethodProcessTokenizationMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to process the payment method tokenization.", {
        channel,
        errors: result.errors,
        id,
      });

      return result;
    }

    const processResult = result.data.paymentMethodProcessTokenization;
    const errors = processResult?.errors ?? [];

    if (
      errors.length ||
      processResult?.result !== "SUCCESSFULLY_TOKENIZED" ||
      !processResult.id
    ) {
      logger.error("Payment method was not tokenized.", {
        channel,
        errors,
        id,
        result: processResult?.result,
      });

      return err([{ code: "PAYMENT_METHOD_PROCESS_ERROR" }]);
    }

    return ok({ id: processResult.id });
  };
