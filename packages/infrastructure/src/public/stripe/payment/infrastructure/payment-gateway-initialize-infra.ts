import { invariant } from "graphql/jsutils/invariant";

import { graphqlClient } from "#root/graphql/client";

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
  }: PaymentServiceConfig): PaymentGatewayInitializeInfra =>
  async ({ id, amount }) => {
    const { data } = await graphqlClient(apiURI).execute(
      PaymentGatewayInitializeMutationDocument,
      {
        variables: { id, amount, gatewayAppId },
        options: {
          cache: "no-store",
        },
      },
    );

    const gatewayConfig = data?.paymentGatewayInitialize?.gatewayConfigs?.find(
      ({ id }) => id === gatewayAppId,
    );

    const errors = [
      ...(data?.paymentGatewayInitialize?.errors ?? []),
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

    return { errors: [] };
  };
