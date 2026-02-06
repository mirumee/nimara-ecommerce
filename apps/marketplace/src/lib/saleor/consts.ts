/**
 * Metadata keys used in Saleor
 */
export const METADATA_KEYS = {
  VENDOR_ID: "vendor.id",
} as const;

/**
 * App configuration
 */
export const APP_CONFIG = {
  NAME: "Marketplace Vendor Panel",
  VERSION: "1.0.0",
  MANIFEST_ID: "marketplace.vendor-panel",
  AUTHOR: "Nimara",
  ALLOWED_DOMAINS: process.env.ALLOWED_SALEOR_DOMAINS?.split(",") || [],
} as const;
