import { z } from "zod";

export const paymentGatewayConfig = z.record(
  z.string(),
  z.object({
    currency: z.string(),
    publicKey: z.string(),
    secretKey: z.string(),
    webhookSecretKey: z.string().optional(),
    webhookId: z.string().optional(),
  }),
);

export type PaymentGatewayConfig = z.infer<typeof paymentGatewayConfig>;

export const saleorAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  paymentGatewayConfig: paymentGatewayConfig,
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfig>;
