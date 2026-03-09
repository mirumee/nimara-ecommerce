import { z } from "zod";

export const schema = z.record(
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    currency: z.string().min(1),
    secretKey: z.string().min(1),
    publicKey: z.string().min(1),
    webhookId: z.string().optional(),
    webhookSecretKey: z.string().optional(),
  }),
);

export type Schema = z.infer<typeof schema>;
