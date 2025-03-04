import { z } from "zod";

import { DEFAULT_PAGE_TITLE } from "@/config";
import { SUPPORTED_LOCALES } from "@/regions/types";

const schema = z.object({
  // Saleor envs
  NEXT_PUBLIC_SALEOR_API_URL: z.string(),
  NEXT_PUBLIC_DEFAULT_CHANNEL: z.string(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(SUPPORTED_LOCALES),
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: z.string().default(DEFAULT_PAGE_TITLE),
  NEXT_PUBLIC_DEFAULT_EMAIL: z.string().email().default("contact@mirumee.com"),

  STRIPE_PUBLIC_KEY: z.string(),
  ENVIRONMENT: z
    .enum(["TEST", "LOCAL", "DEVELOPMENT", "PRODUCTION", "STAGING"])
    .default("LOCAL"),

  PAYMENT_APP_ID: z.string().default("DEVELOPMENT.stripe"),

  NEXT_PUBLIC_BUTTER_CMS_API_KEY: z.string().optional(),

  CMS_SERVICE: z.enum(["saleor", "butter"]).default("saleor"),
});

export const clientEnvs = schema.parse({
  NEXT_PUBLIC_SALEOR_API_URL: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  NEXT_PUBLIC_DEFAULT_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_EMAIL,

  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,

  PAYMENT_APP_ID: process.env.NEXT_PUBLIC_PAYMENT_APP_ID,

  NEXT_PUBLIC_BUTTER_CMS_API_KEY: process.env.NEXT_PUBLIC_BUTTER_CMS_API_KEY,

  CMS_SERVICE: process.env.CMS_SERVICE,
});
