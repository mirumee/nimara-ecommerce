import type { Logger } from "@nimara/infrastructure/logging/types";
import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

import { emptyPaymentService } from "../utils/empty-services";

let paymentServiceInstance: StripePaymentService | null = null;

/**
 * Creates a lazy loader function for the payment service.
 * This function is only used by the service registry.
 *
 * Falls back to {@link emptyPaymentService} when the payment envs are not
 * configured, so the storefront keeps rendering without a payment gateway.
 * Only the public envs are checked — `STRIPE_SECRET_KEY` lives in
 * `serverEnvs`, which is empty in the browser where the client-side payment
 * flows (initialize / element / execute) still need the real service.
 * @internal
 */

export const createPaymentServiceLoader = (logger: Logger) => {
  return async (): Promise<StripePaymentService> => {
    if (paymentServiceInstance) {
      return paymentServiceInstance;
    }

    const apiURI = clientEnvs.NEXT_PUBLIC_SALEOR_API_URL;
    const publicKey = clientEnvs.STRIPE_PUBLIC_KEY;
    const gatewayAppId = clientEnvs.PAYMENT_APP_ID;

    if (!apiURI || !publicKey || !gatewayAppId) {
      logger.warning(
        "Payment is not configured. Set NEXT_PUBLIC_SALEOR_API_URL, NEXT_PUBLIC_STRIPE_PUBLIC_KEY and NEXT_PUBLIC_PAYMENT_APP_ID to enable it.",
      );

      paymentServiceInstance = emptyPaymentService;

      return paymentServiceInstance;
    }

    const { stripePaymentService } =
      await import("@nimara/infrastructure/payment/providers");

    paymentServiceInstance = stripePaymentService({
      apiURI,
      secretKey: serverEnvs.STRIPE_SECRET_KEY || "",
      publicKey,
      environment: clientEnvs.ENVIRONMENT,
      gatewayAppId,
      logger,
    });

    return paymentServiceInstance;
  };
};
