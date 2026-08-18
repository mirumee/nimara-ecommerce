import { z } from "zod";

// Per-channel Stripe gateway configuration, keyed by channel slug.
export const paymentGatewayConfig = z.record(
  z.string(),
  z.object({
    accountId: z.string().optional(),
    currency: z.string(),
    publicKey: z.string(),
    secretKey: z.string(),
    webhookSecretKey: z.string().optional(),
    webhookId: z.string().optional(),
  }),
);

export type PaymentGatewayConfig = z.infer<typeof paymentGatewayConfig>;

export type ChannelGatewayConfig = PaymentGatewayConfig[string];

// Config stored per installed Saleor: install record + its gateway config.
export const stripeAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  paymentGatewayConfig,
});

export type StripeAppConfig = z.infer<typeof stripeAppConfig>;

// The whole tenant map — one store for every installed Saleor, keyed by domain.
export const saleorMultiTenantAppConfig = z.record(z.string(), stripeAppConfig);

export type SaleorMultiTenantAppConfig = z.infer<
  typeof saleorMultiTenantAppConfig
>;
