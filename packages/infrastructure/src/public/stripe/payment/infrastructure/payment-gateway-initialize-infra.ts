import { invariant } from "graphql/jsutils/invariant";

import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { PaymentGatewayInitializeMutationDocument } from "../graphql/mutations/generated";
import { parseApiError } from "../helpers";
import type {
  PaymentGatewayInitializeInfra,
  PaymentServiceConfig,
} from "../types";

export const paymentGatewayInitializeInfra =
  ({
    apiURI,
    gatewayAppId,
    logger,
  }: PaymentServiceConfig): PaymentGatewayInitializeInfra =>
  async ({ id, amount }) => {
    const result = await graphqlClientV2(apiURI).execute(
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

    const errors = [
      ...(result.data.paymentGatewayInitialize?.errors ?? []),
      ...(gatewayConfig?.errors ?? []),
    ];

    if (errors.length) {
      return {
        errors: errors.map(parseApiError("paymentInitialize")),
      };
    }

    invariant(
      gatewayConfig?.data,
      "paymentGatewayInitialize succeeded but no config was returned.",
    );

    return ok({ success: true });
  };
