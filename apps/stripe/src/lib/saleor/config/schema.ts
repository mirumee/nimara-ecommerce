import { z } from "zod";

export const saleorAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  stripeConfig: z.record(
    z.string(),
    z.object({
      currency: z.string(),
      publishableKey: z.string(),
      secretKey: z.string(),
      webhookSecretKey: z.string().optional(),
      webhookId: z.string().optional(),
    }),
  ),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfig>;
