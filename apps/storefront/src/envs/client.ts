import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_CMS_SERVICE: z.enum(["SALEOR", "BUTTER_CMS"]).default("SALEOR"),
  NEXT_PUBLIC_SEARCH_SERVICE: z.enum(["SALEOR", "ALGOLIA"]).default("SALEOR"),
  ENVIRONMENT: z
    .enum(["TEST", "LOCAL", "DEVELOPMENT", "PRODUCTION", "STAGING"])
    .default("LOCAL"),
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_DEFAULT_CHANNEL: z.string().trim(),
  NEXT_PUBLIC_DEFAULT_EMAIL: z
    .string()
    .trim()
    .email()
    .default("contact@mirumee.com"),
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: z
    .string()
    .trim()
    .default("Nimara Storefront"),
  NEXT_PUBLIC_SALEOR_API_URL: z.string().url().trim(),
  NEXT_PUBLIC_STOREFRONT_URL: z.string().url().trim(),
  PAYMENT_APP_ID: z.string().trim(),
  STRIPE_PUBLIC_KEY: z.string().trim(),
  // Algolia specific
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().trim().min(1).default(""),
  NEXT_PUBLIC_ALGOLIA_API_KEY: z.string().trim().min(1).default(""),
});

export const clientEnvs = schema.parse({
  NEXT_PUBLIC_CMS_SERVICE: process.env.NEXT_PUBLIC_CMS_SERVICE,
  NEXT_PUBLIC_SEARCH_SERVICE: process.env.NEXT_PUBLIC_SEARCH_SERVICE,
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: process.env.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL,
  NEXT_PUBLIC_DEFAULT_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_EMAIL,
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  NEXT_PUBLIC_SALEOR_API_URL: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  NEXT_PUBLIC_STOREFRONT_URL: process.env.NEXT_PUBLIC_STOREFRONT_URL,
  PAYMENT_APP_ID: process.env.NEXT_PUBLIC_PAYMENT_APP_ID,
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  NEXT_PUBLIC_ALGOLIA_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
});
