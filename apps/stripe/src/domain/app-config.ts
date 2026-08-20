import { z } from "zod";

export const paymentGatewayConfig = z.object({
  accountId: z.string().optional(),
  publicKey: z.string(),
  secretKey: z.string(),
  webhookSecretKey: z.string().optional(),
  webhookId: z.string().optional(),
});

export type PaymentGatewayConfig = z.infer<typeof paymentGatewayConfig>;

/**
 * Every channel uses `default`; `channelOverrides` replaces it wholesale.
 * Which channel the UI collects it on comes from `DEFAULT_CHANNEL_SLUG`.
 */
export const paymentGatewayConfigSet = z.object({
  default: paymentGatewayConfig.nullable(),
  channelOverrides: z.record(z.string(), paymentGatewayConfig),
});

export type PaymentGatewayConfigSet = z.infer<typeof paymentGatewayConfigSet>;

export const emptyPaymentGatewayConfigSet = (): PaymentGatewayConfigSet => ({
  default: null,
  channelOverrides: {},
});

export const appConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  paymentGatewayConfigSet,
});

export type AppConfig = z.infer<typeof appConfig>;

// The whole tenant map — one store for every installed Saleor, keyed by domain.
export const saleorMultiTenantAppConfig = z.record(z.string(), appConfig);

export type SaleorMultiTenantAppConfig = z.infer<
  typeof saleorMultiTenantAppConfig
>;
