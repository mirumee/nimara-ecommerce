import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      // Czy saleor powinien byc default?
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      // Czy stripe powinien byc default?
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    })
  : ({} as Schema);
