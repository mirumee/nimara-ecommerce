import { z } from "zod";

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
  // Strona nie powinna zależeć od CMS
  NEXT_PUBLIC_CMS_SERVICE: z.enum(["SALEOR", "BUTTER_CMS", ""]),
  // Strona nie powinna zalerząć od Search
  NEXT_PUBLIC_SEARCH_SERVICE: z.enum(["SALEOR", "ALGOLIA", ""]),
  // Default Local
  ENVIRONMENT: z
    .enum(["TEST", "LOCAL", "DEVELOPMENT", "PRODUCTION", "STAGING"])
    .default("LOCAL"),
  // Strona nie powinna zależeć od CMS
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().optional(),
  ),
  // czym jest channel dla nimary?
  NEXT_PUBLIC_DEFAULT_CHANNEL: z.string().trim(),
  // !! marketing :)
  NEXT_PUBLIC_DEFAULT_EMAIL: z.preprocess(
    emptyStringToUndefined,
    z.email().default("contact@mirumee.com"),
  ),

  // Teoretycznie jest to zbędne
  NEXT_PUBLIC_DEFAULT_PAGE_TITLE: z.preprocess(
    emptyStringToUndefined,
    z.string().default("Nimara Storefront"),
  ),
  // Saleor nie powinien byc wymagany
  NEXT_PUBLIC_SALEOR_API_URL: z.preprocess(
    emptyStringToUndefined,
    z.url().optional(),
  ),
  // Czy nie da się inaczej?
  NEXT_PUBLIC_STOREFRONT_URL: z.preprocess(
    (val) => normalizePublicUrl(val) ?? defaultStorefrontUrl,
    z.url(),
  ),
  // Nie trzeba checkout a start
  PAYMENT_APP_ID: z.preprocess(emptyStringToUndefined, z.string().optional()),
  // Nie trzeba checkout a start
  STRIPE_PUBLIC_KEY: z.string().trim().optional(),
  // Algolia specific - Tylko jak jest search
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional(),
  ),
  NEXT_PUBLIC_ALGOLIA_API_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional(),
  ),
  NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT: z
    .enum(["AVIF", "WEBP", "ORIGINAL"])
    .default("AVIF"),
  // Marketplace - when true, cart only allows products from the same vendor (marketplace behavior).
  // Defaults to false. Set to any value other than "false" (e.g. "true") to enable.
  NEXT_PUBLIC_MARKETPLACE_ENABLED: z
    .string()
    .optional()
    .default("false")
    .transform((s) => s !== "false"),
  // Public vendor portal URL (footer links). Empty/unset hides marketplace column.
  NEXT_PUBLIC_MARKETPLACE_VENDOR_URL: z.preprocess(
    normalizePublicUrl,
    z.url().optional(),
  ),
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
  NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT:
    process.env.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT,
  NEXT_PUBLIC_MARKETPLACE_ENABLED: process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED,
  NEXT_PUBLIC_MARKETPLACE_VENDOR_URL:
    process.env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL,
});
