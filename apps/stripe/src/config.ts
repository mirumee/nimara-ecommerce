import { z } from "zod";

import { prepareConfig } from "@/lib/zod/util";

const configSchema = z.object({
  NAME: z.string(),
  VERSION: z.string(),
  ENVIRONMENT: z.string(),
  CONFIG_KEY: z.string().default("stripeConfig"),
});

console.log(process.env);

const parsed = prepareConfig({
  name: "App",
  schema: configSchema,
  input: {
    NAME: process.env.npm_package_name,
    VERSION: process.env.npm_package_version,
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },
  serverOnly: true,
});

export const CONFIG = {
  ...parsed,
  RELEASE: `${parsed.NAME}@${parsed.VERSION}`,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
