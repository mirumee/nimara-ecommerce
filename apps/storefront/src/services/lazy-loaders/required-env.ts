import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";

const getRequiredEnv = (
  value: string | undefined,
  envName: string,
  serviceName: string,
) => {
  if (!value) {
    throw new Error(`Please set ${envName} to use ${serviceName}.`);
  }

  return value;
};

export const getRequiredPaymentAppId = (serviceName: string) =>
  getRequiredEnv(
    clientEnvs.PAYMENT_APP_ID,
    "NEXT_PUBLIC_PAYMENT_APP_ID",
    serviceName,
  );

export const getRequiredSaleorApiUrl = (serviceName: string) =>
  getRequiredEnv(
    clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    "NEXT_PUBLIC_SALEOR_API_URL",
    serviceName,
  );

export const getRequiredStripePublicKey = (serviceName: string) =>
  getRequiredEnv(
    clientEnvs.STRIPE_PUBLIC_KEY,
    "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",
    serviceName,
  );

export const getRequiredStripeSecretKey = (serviceName: string) =>
  getRequiredEnv(
    serverEnvs.STRIPE_SECRET_KEY,
    "STRIPE_SECRET_KEY",
    serviceName,
  );

export const getRequiredButterCMSApiKey = (serviceName: string) =>
  getRequiredEnv(
    clientEnvs.BUTTER_CMS_API_KEY,
    "NEXT_PUBLIC_BUTTER_CMS_API_KEY",
    serviceName,
  );
