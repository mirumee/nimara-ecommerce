import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off", ""].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

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

  // App config provider
  MARKETPLACE_APP_CONFIG_PROVIDER: z.enum(["aws", "edge"]).default("aws"),
  VERCEL_ACCESS_TOKEN: z.string().optional(),
  VERCEL_TEAM_ID: z.string().optional(),
  VERCEL_EDGE_CONFIG_ID: z.string().optional(),
  MARKETPLACE_APP_CONFIG_EDGE_KEY: z.string().default("marketplace-app-config"),
  MARKETPLACE_EDGE_CONFIG: z.string().optional(),

  // Saleor
  NEXT_PUBLIC_SALEOR_URL: z.string().optional(),
  NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG: z
    .string()
    .default("default-channel"),
  NEXT_PUBLIC_GRAPHQL_URL: z
    .string()
    .default("http://localhost:3001/api/graphql"),

  // URLs
  NEXT_PUBLIC_MARKETPLACE_VENDOR_URL: z.string().optional(),
  NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL: z
    .string()
    .default("http://localhost:3000"),

  // Vercel system env vars (auto-injected by Vercel)
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),

  // Development
  NEXT_PUBLIC_SALEOR_UI_APP_TOKEN: z.string().optional(),

  // Email / SMTP (provider-agnostic)
  MARKETPLACE_SMTP_HOST: z.string().optional(),
  MARKETPLACE_SMTP_PORT: z.coerce.number().default(587),
  MARKETPLACE_SMTP_USER: z.string().optional(),
  MARKETPLACE_SMTP_PASSWORD: z.string().optional(),
  MARKETPLACE_SMTP_SECURE: booleanFromEnv.default(false),
  MARKETPLACE_EMAIL_FROM: z.string().optional(),
  MARKETPLACE_SUPERADMIN_EMAIL: z.string().optional(),
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

/**
 * Resolves the vendor URL with proper fallback logic:
 * 1. Explicit NEXT_PUBLIC_MARKETPLACE_VENDOR_URL (highest priority)
 * 2. On Vercel production: VERCEL_PROJECT_PRODUCTION_URL
 * 3. On Vercel preview: VERCEL_URL (preview deployment URL)
 * 4. Fallback: localhost for development
 */
function resolveVendorUrl(): string {
  if (env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL) {
    return env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL;
  }

  if (env.VERCEL) {
    if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (env.VERCEL_URL) {
      return `https://${env.VERCEL_URL}`;
    }
  }

  const port = env.MARKETPLACE_PORT;

  return `http://localhost:${port}`;
}

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
  appConfig: {
    provider: env.MARKETPLACE_APP_CONFIG_PROVIDER,
    edge: {
      accessToken: env.VERCEL_ACCESS_TOKEN,
      teamId: env.VERCEL_TEAM_ID,
      edgeConfigId: env.VERCEL_EDGE_CONFIG_ID,
      configKey: env.MARKETPLACE_APP_CONFIG_EDGE_KEY,
      edgeConfigConnectionString: env.MARKETPLACE_EDGE_CONFIG,
    },
  },
  saleor: {
    url: env.NEXT_PUBLIC_SALEOR_URL,
    channelSlug: env.NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG,
    graphqlUrl: env.NEXT_PUBLIC_GRAPHQL_URL,
    devToken: env.NEXT_PUBLIC_SALEOR_UI_APP_TOKEN,
  },
  urls: {
    get vendor(): string {
      return resolveVendorUrl();
    },
    storefront: env.NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL,
  },
  email: {
    smtp: {
      host: env.MARKETPLACE_SMTP_HOST,
      port: env.MARKETPLACE_SMTP_PORT,
      secure: env.MARKETPLACE_SMTP_SECURE,
      user: env.MARKETPLACE_SMTP_USER,
      password: env.MARKETPLACE_SMTP_PASSWORD,
    },
    from: env.MARKETPLACE_EMAIL_FROM,
    superadminEmail: env.MARKETPLACE_SUPERADMIN_EMAIL,
  },
} as const;
