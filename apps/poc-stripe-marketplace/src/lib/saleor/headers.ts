import { z } from "zod";

export const saleorHeaders = z.object({
  "saleor-domain": z.string(),
  "saleor-api-url": z.string().url(),
});

export type SaleorHeaders = z.infer<typeof saleorHeaders>;

export const saleorWebhookHeaders = saleorHeaders.extend({
  "saleor-signature": z.string(),
});

export type SaleorWebhookHeaders = z.infer<typeof saleorWebhookHeaders>;
