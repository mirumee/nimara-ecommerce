import { z } from "zod";

import { prepareConfig } from "@/lib/zod/util";

const configSchema = z.object({
  NAME: z.string(),
  VERSION: z.string(),
  ENVIRONMENT: z.string(),
  SALEOR_URL: z.string().url(),
  SALEOR_DOMAIN: z.string(),
  FETCH_TIMEOUT: z
    .number()
    .default(10000)
    .describe("Fetch timeout in milliseconds."),
  VERCEL_ACCESS_TOKEN: z.string().describe("Vercel access token."),
  VERCEL_TEAM_ID: z.string().describe("Your Vercel Team ID."),
  VERCEL_EDGE_CONFIG_ID: z.string().describe("Edge config database ID."),
  CONFIG_KEY: z.string().describe("Config provider key."),
  STRIPE_API_VERSION: z.string().default("2025-01-27.acacia"),
});

const parsed = prepareConfig({
  name: "App",
  schema: configSchema,
  input: {
    NAME: process.env.npm_package_name,
    VERSION: process.env.npm_package_version,
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    SALEOR_URL: new URL(process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "").origin,
    SALEOR_DOMAIN: new URL(process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "").host,
  },
  serverOnly: true,
});

export const CONFIG = {
  ...parsed,
  RELEASE: `${parsed.NAME}@${parsed.VERSION}`,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
