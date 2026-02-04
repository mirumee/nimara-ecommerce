import { z } from "zod";

const envSchema = z.object({
  MARKETPLACE_NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MARKETPLACE_PORT: z.coerce.number().default(3001),
  MARKETPLACE_BASE_PATH: z.string().default(""),
  MARKETPLACE_CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // AWS
  AWS_ACCESS_KEY_ID: z.string().default("test"),
  AWS_SECRET_ACCESS_KEY: z.string().default("test"),
  AWS_SESSION_TOKEN: z.string().optional(),
  AWS_REGION: z.string().default("ap-southeast-1"),
  AWS_ENDPOINT_URL: z.string().optional(),
  SECRET_MANAGER_APP_CONFIG_PATH: z.string().default("/marketplace/app-config"),

  // Saleor
  NEXT_PUBLIC_SALEOR_URL: z.string().url(),
  NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG: z
    .string()
    .default("default-channel"),
  NEXT_PUBLIC_GRAPHQL_URL: z
    .string()
    .default("http://localhost:3001/api/graphql"),

  // URLs
  NEXT_PUBLIC_MARKETPLACE_VENDOR_URL: z
    .string()
    .default("http://localhost:3001"),
  NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL: z
    .string()
    .default("http://localhost:3000"),

  // Development
  NEXT_PUBLIC_SALEOR_UI_APP_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();

export const config = {
  isDev: env.MARKETPLACE_NODE_ENV === "development",
  isProd: env.MARKETPLACE_NODE_ENV === "production",
  isTest: env.MARKETPLACE_NODE_ENV === "test",
  port: env.MARKETPLACE_PORT,
  basePath: env.MARKETPLACE_BASE_PATH,
  corsOrigins: env.MARKETPLACE_CORS_ORIGINS,
  logLevel: env.LOG_LEVEL,
  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    sessionToken: env.AWS_SESSION_TOKEN,
    region: env.AWS_REGION,
    endpointUrl: env.AWS_ENDPOINT_URL,
    secretManagerPath: env.SECRET_MANAGER_APP_CONFIG_PATH,
  },
  saleor: {
    url: env.NEXT_PUBLIC_SALEOR_URL,
    channelSlug: env.NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG,
    graphqlUrl: env.NEXT_PUBLIC_GRAPHQL_URL,
    devToken: env.NEXT_PUBLIC_SALEOR_UI_APP_TOKEN,
  },
  urls: {
    vendor: env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL,
    storefront: env.NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL,
  },
} as const;
