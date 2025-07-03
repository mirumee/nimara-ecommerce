import { z } from "zod";

import { DEFAULT_PAGE_TITLE } from "@/config";

const schema = z.object({
  CMS_SERVICE: z.enum(["saleor", "butter"]).default("saleor"),
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
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: z.string().trim().default(DEFAULT_PAGE_TITLE),
  NEXT_PUBLIC_SALEOR_API_URL: z.string().url().trim(),
  NEXT_PUBLIC_STOREFRONT_URL: z.string().url().trim(),
  PAYMENT_APP_ID: z.string().trim(),
  STRIPE_PUBLIC_KEY: z.string().trim(),
});

export const clientEnvs = schema.parse({
  CMS_SERVICE: process.env.CMS_SERVICE,
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: process.env.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL,
  NEXT_PUBLIC_DEFAULT_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_EMAIL,
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  NEXT_PUBLIC_SALEOR_API_URL: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  NEXT_PUBLIC_STOREFRONT_URL: process.env.NEXT_PUBLIC_STOREFRONT_URL,
  PAYMENT_APP_ID: process.env.NEXT_PUBLIC_PAYMENT_APP_ID,
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
});
