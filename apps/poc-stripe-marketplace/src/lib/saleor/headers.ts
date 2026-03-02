import { z } from "zod";

export const saleorHeaders = z.object({
  "saleor-domain": z.string(),
  "saleor-api-url": z.string().url(),
});

export type SaleorHeaders = z.infer<typeof saleorHeaders>;
