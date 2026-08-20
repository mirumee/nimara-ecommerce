import { z } from "zod";

/**
 * Shape of the configuration form, keyed by channel slug. Shared between the
 * client UI and the config API endpoints.
 */
export const configFormSchema = z.record(
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

export type ConfigFormSchema = z.infer<typeof configFormSchema>;
