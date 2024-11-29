import * as Sentry from "@sentry/nextjs";

import type { ErrorService } from "@nimara/infrastructure/error/service";
import { saleorAddressService } from "@nimara/infrastructure/public/saleor/address/index";
import { saleorAuthService } from "@nimara/infrastructure/public/saleor/auth/index";
import { saleorCartService } from "@nimara/infrastructure/public/saleor/cart/index";
import { saleorCheckoutService } from "@nimara/infrastructure/public/saleor/checkout/service";
import { saleorFulfillmentService } from "@nimara/infrastructure/public/saleor/fulfillment/service";
import { saleorStoreService } from "@nimara/infrastructure/public/saleor/store/index";
import { saleorUserService } from "@nimara/infrastructure/public/saleor/user/index";
import { stripePaymentService } from "@nimara/infrastructure/public/stripe/payment/index";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

export const checkoutService = saleorCheckoutService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
});

export const fulfillmentService = saleorFulfillmentService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  appToken: serverEnvs.SALEOR_APP_TOKEN,
});

export const storeService = saleorStoreService;

export const cartService = saleorCartService;

export const addressService = saleorAddressService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
});

export const authService = saleorAuthService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
});

export const userService = saleorUserService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
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
});
