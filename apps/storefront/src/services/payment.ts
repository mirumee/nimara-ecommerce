import { stripePaymentService } from "@nimara/infrastructure/payment/providers";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { storefrontLogger } from "@/services/logging";

export const paymentService = stripePaymentService({
  apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  secretKey: serverEnvs.STRIPE_SECRET_KEY,
  publicKey: clientEnvs.STRIPE_PUBLIC_KEY,
  environment: clientEnvs.ENVIRONMENT,
  gatewayAppId: clientEnvs.PAYMENT_APP_ID,
  logger: storefrontLogger,
});
