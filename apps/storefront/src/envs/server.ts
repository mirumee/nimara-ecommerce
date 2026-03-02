import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  MARKETPLACE_MODE: z.coerce.boolean().default(false),
  POC_STRIPE_MARKETPLACE_URL: z.string().url().optional(),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      MARKETPLACE_MODE: process.env.MARKETPLACE_MODE,
      POC_STRIPE_MARKETPLACE_URL:
        process.env.POC_STRIPE_MARKETPLACE_URL ||
        process.env.NEXT_PUBLIC_POC_STRIPE_MARKETPLACE_URL,
    })
  : ({} as Schema);
