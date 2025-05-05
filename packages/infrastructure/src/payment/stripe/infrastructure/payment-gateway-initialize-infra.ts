import { invariant } from "graphql/jsutils/invariant";

import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  PaymentGatewayInitializeInfra,
  PaymentServiceConfig,
} from "../../types";
import { PaymentGatewayInitializeMutationDocument } from "../graphql/mutations/generated";

export const paymentGatewayInitializeInfra =
  ({
    apiURI,
    gatewayAppId,
    logger,
  }: PaymentServiceConfig): PaymentGatewayInitializeInfra =>
  async ({ id, amount }) => {
    const result = await graphqlClient(apiURI).execute(
      PaymentGatewayInitializeMutationDocument,
      {
        variables: { id, amount, gatewayAppId },
        options: {
          cache: "no-store",
        },
        operationName: "PaymentGatewayInitializeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to initialize payment gateway.", {
        errors: result.errors,
        id,
        amount,
      });

      return result;
    }

    if (result.data.paymentGatewayInitialize?.errors.length) {
      logger.error("Payment gateway initialization returned errors", {
        errors: result.data.paymentGatewayInitialize.errors,
        id,
        amount,
      });

      return err([{ code: "PAYMENT_GATEWAY_INITIALIZE_ERROR" }]);
    }

    const gatewayConfig =
      result.data.paymentGatewayInitialize?.gatewayConfigs?.find(
        ({ id }) => id === gatewayAppId,
      );

    if (gatewayConfig?.errors?.length) {
      logger.error("Payment gateway initialization returned errors", {
        errors: gatewayConfig.errors,
        id,
        amount,
      });

      return err([{ code: "PAYMENT_GATEWAY_INITIALIZE_ERROR" }]);
    }

    invariant(
      gatewayConfig?.data,
      "paymentGatewayInitialize succeeded but no config was returned.",
    );

    return ok({ success: true });
  };
