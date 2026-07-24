import type { Logger } from "@nimara/infrastructure/logging/types";
import { type LegacyStripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

import { emptyLegacyPaymentService } from "../utils/empty-services";

let legacyPaymentServiceInstance: LegacyStripePaymentService | null = null;

/**
 * Creates a lazy loader function for the legacy (stateful) payment service.
 * It backs the customer / saved-payment-method flows; the core payment flow
 * runs on the stateless service from {@link ./payment}.
 * This function is only used by the service registry.
 *
 * Falls back to {@link emptyLegacyPaymentService} when the payment envs are
 * not configured, so the storefront keeps rendering without a payment
 * gateway. Only the public envs are checked — `STRIPE_SECRET_KEY` lives in
 * `serverEnvs`, which is empty in the browser where the client-side payment
 * flows still need the real service.
 * @internal
 */

export const createLegacyPaymentServiceLoader = (logger: Logger) => {
  return async (): Promise<LegacyStripePaymentService> => {
    if (legacyPaymentServiceInstance) {
      return legacyPaymentServiceInstance;
    }

    const apiURI = clientEnvs.NEXT_PUBLIC_SALEOR_API_URL;
    const publicKey = clientEnvs.STRIPE_PUBLIC_KEY;
    const gatewayAppId = clientEnvs.PAYMENT_APP_ID;

    if (!apiURI || !publicKey || !gatewayAppId) {
      logger.warning(
        "Payment is not configured. Set NEXT_PUBLIC_SALEOR_API_URL, NEXT_PUBLIC_STRIPE_PUBLIC_KEY and NEXT_PUBLIC_PAYMENT_APP_ID to enable it.",
      );

      legacyPaymentServiceInstance = emptyLegacyPaymentService;

      return legacyPaymentServiceInstance;
    }

    const { legacyStripePaymentService } =
      await import("@nimara/infrastructure/payment/providers");

    legacyPaymentServiceInstance = legacyStripePaymentService({
      apiURI,
      secretKey: serverEnvs.STRIPE_SECRET_KEY || "",
      publicKey,
      environment: clientEnvs.ENVIRONMENT,
      gatewayAppId,
      logger,
    });

    return legacyPaymentServiceInstance;
  };
};
