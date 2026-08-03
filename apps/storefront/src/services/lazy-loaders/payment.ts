import type { Logger } from "@nimara/infrastructure/logging/types";
import { type StripePaymentService } from "@nimara/infrastructure/payment/stripe/types";

import { clientEnvs } from "@/envs/client";

import { emptyPaymentService } from "../utils/empty-services";

let paymentServiceInstance: StripePaymentService | null = null;

/**
 * This and `@/features/payment/providers/active` are the only files that name
 * a gateway; swapping provider means editing both.
 */
export const createPaymentServiceLoader = (logger: Logger) => {
  return async (): Promise<StripePaymentService> => {
    if (paymentServiceInstance) {
      return paymentServiceInstance;
    }

    const apiURI = clientEnvs.NEXT_PUBLIC_SALEOR_API_URL;
    const gatewayAppId = clientEnvs.PAYMENT_APP_ID;

    if (!apiURI || !gatewayAppId) {
      logger.warning(
        "Payment is not configured. Set NEXT_PUBLIC_SALEOR_API_URL and NEXT_PUBLIC_PAYMENT_APP_ID to enable it.",
      );

      paymentServiceInstance = emptyPaymentService;

      return paymentServiceInstance;
    }

    const { stripePaymentService } =
      await import("@nimara/infrastructure/payment/providers");

    paymentServiceInstance = stripePaymentService({
      apiURI,
      gatewayAppId,
      logger,
    });

    return paymentServiceInstance;
  };
};
