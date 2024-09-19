import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string(),
  STRIPE_SECRET_KEY: z.string(),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    })
  : ({} as Schema);
