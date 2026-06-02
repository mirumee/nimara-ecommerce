import { z } from "zod";

import {
  CMS_PROVIDER_IDS,
  SEARCH_PROVIDER_IDS,
} from "@nimara/infrastructure/providers-catalog";

const emptyStringToUndefined = (val: unknown) => {
  if (typeof val !== "string") {
    return val;
  }

  const trimmed = val.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizePublicUrl = (val: unknown) => {
  const value = emptyStringToUndefined(val);

  if (typeof value !== "string") {
    return value;
  }

  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
};

const defaultStorefrontUrl = `https://${process.env.VERCEL_BRANCH_URL || "localhost:3000"}`;

const schema = z.object({
  ENVIRONMENT: z.preprocess(
    emptyStringToUndefined,
    z
      .enum(["TEST", "LOCAL", "DEVELOPMENT", "PRODUCTION", "STAGING"])
      .default("LOCAL"),
  ),
  NEXT_PUBLIC_DEFAULT_CHANNEL: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().default("default-channel"),
  ),
  NEXT_PUBLIC_DEFAULT_EMAIL: z.preprocess(
    emptyStringToUndefined,
    z.email().default("contact@mirumee.com"),
  ),
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: z.preprocess(
    emptyStringToUndefined,
    z.string().default("Nimara Storefront"),
  ),
  NEXT_PUBLIC_SALEOR_API_URL: z.preprocess(
    emptyStringToUndefined,
    z.url().optional(),
  ),
  NEXT_PUBLIC_STOREFRONT_URL: z.preprocess(
    (val) => normalizePublicUrl(val) ?? defaultStorefrontUrl,
    z.url(),
  ),
  PAYMENT_APP_ID: z.preprocess(emptyStringToUndefined, z.string().optional()),
  STRIPE_PUBLIC_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT: z.preprocess(
    emptyStringToUndefined,
    z.enum(["AVIF", "WEBP", "ORIGINAL"]).default("AVIF"),
  ),

  NEXT_PUBLIC_MARKETPLACE_ENABLED: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .optional()
      .default("false")
      .transform((s) => s !== "false"),
  ),
  NEXT_PUBLIC_MARKETPLACE_VENDOR_URL: z.preprocess(
    normalizePublicUrl,
    z.url().optional(),
  ),

  // --- Integrations (provider selection, build-time) ------------------------
  // Each capability is served by one swappable provider. Defaults to "saleor".
  // The selected provider's credentials below become required at first use.
  SEARCH_SERVICE: z.preprocess(
    emptyStringToUndefined,
    z.enum(SEARCH_PROVIDER_IDS).default("saleor"),
  ),
  CMS_SERVICE: z.preprocess(
    emptyStringToUndefined,
    z.enum(CMS_PROVIDER_IDS).default("saleor"),
  ),
  // Provider credentials are NOT validated here. Each provider owns its config
  // contract and validates only its own (server-side, namespaced) env when
  // selected — see infrastructure/<capability>/<provider>/config.ts.
  // ButterCMS (used when CMS_SERVICE=butter-cms) — CMS not yet migrated.
  BUTTER_CMS_API_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().optional(),
  ),
});

export const clientEnvs = schema.parse({
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_DEFAULT_CHANNEL: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL,
  NEXT_PUBLIC_DEFAULT_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_EMAIL,
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  NEXT_PUBLIC_SALEOR_API_URL: process.env.NEXT_PUBLIC_SALEOR_API_URL,
  NEXT_PUBLIC_STOREFRONT_URL: process.env.NEXT_PUBLIC_STOREFRONT_URL,
  PAYMENT_APP_ID: process.env.NEXT_PUBLIC_PAYMENT_APP_ID,
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT:
    process.env.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT,
  NEXT_PUBLIC_MARKETPLACE_ENABLED: process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED,
  NEXT_PUBLIC_MARKETPLACE_VENDOR_URL:
    process.env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL,
  SEARCH_SERVICE: process.env.NEXT_PUBLIC_SEARCH_SERVICE,
  CMS_SERVICE: process.env.NEXT_PUBLIC_CMS_SERVICE,
  BUTTER_CMS_API_KEY: process.env.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
});
