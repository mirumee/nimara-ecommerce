import * as Sentry from "@sentry/nextjs";

import { saleorAddressService } from "@nimara/infrastructure/address/index";
import { saleorAuthService } from "@nimara/infrastructure/auth/index";
import { saleorCartService } from "@nimara/infrastructure/cart/index";
import { saleorCheckoutService } from "@nimara/infrastructure/checkout/service";
import { saleorCollectionService } from "@nimara/infrastructure/collection/index";
import type { ErrorService } from "@nimara/infrastructure/error/service";
import { saleorFulfillmentService } from "@nimara/infrastructure/fulfillment/service";
import { stripePaymentService } from "@nimara/infrastructure/payment/providers";
import { saleorStoreService } from "@nimara/infrastructure/store/index";
import { saleorUserService } from "@nimara/infrastructure/user/index";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { storefrontLogger } from "@/services/logging";

export const checkoutService = saleorCheckoutService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});

export const fulfillmentService = saleorFulfillmentService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  appToken: serverEnvs.SALEOR_APP_TOKEN,
  logger: storefrontLogger,
});

export const storeService = saleorStoreService;

export const cartService = saleorCartService;

export const addressService = saleorAddressService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});

export const authService = saleorAuthService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});

export const userService = saleorUserService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});

type Context = Parameters<typeof Sentry.captureException>[1];
export const errorService: ErrorService<Context> = {
  logError: (error, context): string => {
    return Sentry.captureException(error, context);
  },
};

export const paymentService = stripePaymentService({
  apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  secretKey: serverEnvs.STRIPE_SECRET_KEY,
  publicKey: clientEnvs.STRIPE_PUBLIC_KEY,
  environment: clientEnvs.ENVIRONMENT,
  gatewayAppId: clientEnvs.PAYMENT_APP_ID,
  logger: storefrontLogger,
});

export const collectionService = saleorCollectionService({
  apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});
