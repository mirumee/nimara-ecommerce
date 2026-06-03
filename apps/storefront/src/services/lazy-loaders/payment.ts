import type { Logger } from "@nimara/infrastructure/logging/types";
import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";

import {
  getRequiredPaymentAppId,
  getRequiredSaleorApiUrl,
  getRequiredStripePublicKey,
  getRequiredStripeSecretKey,
} from "../utils/required-env";

let paymentServiceInstance: StripePaymentService | null = null;

/**
 * Creates a lazy loader function for the CMS page service.
 * This function is only used by the service registry.
 * @internal
 */

export const createPaymentServiceLoader = (logger: Logger) => {
  return async (): Promise<StripePaymentService> => {
    if (paymentServiceInstance) {
      return paymentServiceInstance;
    }

    const { stripePaymentService } =
      await import("@nimara/infrastructure/payment/providers");

    paymentServiceInstance = stripePaymentService({
      apiURI: getRequiredSaleorApiUrl("payment service"),
      secretKey: getRequiredStripeSecretKey("payment service"),
      publicKey: getRequiredStripePublicKey("payment service"),
      environment: clientEnvs.ENVIRONMENT,
      gatewayAppId: getRequiredPaymentAppId("payment service"),
      logger,
    });

    return paymentServiceInstance;
  };
};
