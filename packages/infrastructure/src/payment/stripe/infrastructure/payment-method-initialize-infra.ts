import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { type Maybe } from "#root/lib/types";

import { PaymentMethodInitializeTokenizationMutationDocument } from "../../saleor/graphql/mutations/generated";
import type { PaymentServiceConfig } from "../../types";
import type {
  StripeGatewayConfig,
  StripePaymentMethodInitializeInfra,
} from "../types";

export const paymentMethodInitializeInfra =
  ({
    apiURI,
    gatewayAppId,
    logger,
  }: PaymentServiceConfig): StripePaymentMethodInitializeInfra =>
  async ({ accessToken, channel, data }) => {
    const result = await graphqlClient(apiURI, accessToken).execute(
      PaymentMethodInitializeTokenizationMutationDocument,
      {
        variables: { channel, data, gatewayAppId },
        operationName: "PaymentMethodInitializeTokenizationMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to initialize the payment method tokenization.", {
        channel,
        errors: result.errors,
      });

      return result;
    }

    const initializeResult = result.data.paymentMethodInitializeTokenization;
    const errors = initializeResult?.errors ?? [];
    const tokenizationData = initializeResult?.data as Maybe<
      StripeGatewayConfig & {
        setupIntent: { clientSecret: string };
      }
    >;

    if (
      errors.length ||
      !initializeResult?.id ||
      !tokenizationData?.publishableKey ||
      !tokenizationData.setupIntent?.clientSecret
    ) {
      logger.error("Payment method tokenization not initialized properly.", {
        channel,
        errors,
        result: initializeResult,
      });

      return err([{ code: "PAYMENT_METHOD_INITIALIZE_ERROR" }]);
    }

    return ok({
      gatewayConfig: { publishableKey: tokenizationData.publishableKey },
      id: initializeResult.id,
      providerData: { clientSecret: tokenizationData.setupIntent.clientSecret },
    });
  };
