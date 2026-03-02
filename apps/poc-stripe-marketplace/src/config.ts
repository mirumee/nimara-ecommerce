import { z } from "zod";

import packageJson from "../package.json";

const configSchema = z.object({
  NAME: z.string().default(packageJson.name),
  VERSION: z.string().default(packageJson.version),
  ENVIRONMENT: z.string(),
  SALEOR_API_URL: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SESSION_TOKEN: z.string().optional(),
  AWS_REGION: z.string().default("ap-southeast-1"),
  AWS_ENDPOINT_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SIGNING_SECRET: z.string(),
  SECRET_MANAGER_APP_CONFIG_PATH: z
    .string()
    .default("/poc-stripe-marketplace/app-config"),
});

const parsed = configSchema.parse({
  NAME: packageJson.name,
  VERSION: packageJson.version,
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  SALEOR_API_URL: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SIGNING_SECRET: process.env.STRIPE_WEBHOOK_SIGNING_SECRET,
  SECRET_MANAGER_APP_CONFIG_PATH: process.env.SECRET_MANAGER_APP_CONFIG_PATH,
});

export const CONFIG = {
  ...parsed,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
  SALEOR_DOMAIN: new URL(parsed.SALEOR_API_URL).host,
};
