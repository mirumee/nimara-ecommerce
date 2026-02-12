import type { Logger } from "@nimara/infrastructure/logging/types";
import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

/**
 * Creates a lazy loader function for the CMS page service.
 * This function is only used by the service registry.
 * @internal
 */
export const createPaymentServiceLoader = (logger: Logger) => {
  let paymentServiceInstance: StripePaymentService | null = null;

  return async (): Promise<StripePaymentService> => {
    if (paymentServiceInstance) {
      return paymentServiceInstance;
    }

    const { stripePaymentService } =
      await import("@nimara/infrastructure/payment/providers");

    paymentServiceInstance = stripePaymentService({
      apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      secretKey: serverEnvs.STRIPE_SECRET_KEY,
      publicKey: clientEnvs.STRIPE_PUBLIC_KEY,
      environment: clientEnvs.ENVIRONMENT,
      gatewayAppId: clientEnvs.PAYMENT_APP_ID,
      logger,
    });

    return paymentServiceInstance;
  };
};
