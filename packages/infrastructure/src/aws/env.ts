import { z } from "zod";

import { readEnv } from "#root/lib/env/env";

const blankAsUnset = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

/**
 * The SDK reads these from the environment, not from the client constructor,
 * so a missing one surfaces deep inside the first call. Adapters check before
 * building a client.
 */
export const requireAwsEnvironment = (name: string) => {
  readEnv({
    name,
    schema: z.object({
      AWS_ACCESS_KEY_ID: z.string(),
      AWS_ENDPOINT_URL: blankAsUnset(z.url().optional()),
      AWS_REGION: z.string(),
      AWS_SECRET_ACCESS_KEY: z.string(),
    }),
  });
};
