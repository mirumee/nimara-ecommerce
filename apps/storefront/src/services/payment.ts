import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: StripePaymentService | null = null;

/**
 * Loads the Saleor StripePaymentService instance.
 * @returns A promise that resolves to the CheckoutService instance.
 */
export const getPaymentService = async (): Promise<StripePaymentService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ stripePaymentService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/payment/providers"),
    getStorefrontLogger(),
  ]);

  loadedService = stripePaymentService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    secretKey: serverEnvs.STRIPE_SECRET_KEY,
    publicKey: clientEnvs.STRIPE_PUBLIC_KEY,
    environment: clientEnvs.ENVIRONMENT,
    gatewayAppId: clientEnvs.PAYMENT_APP_ID,
    logger: storefrontLogger,
  });

  return loadedService;
};
