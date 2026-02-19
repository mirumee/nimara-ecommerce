/**
 * Metadata keys used in Saleor
 *
 * Vendor identification:
 * - vendor.id = Vendor Profile Page.id (links customer account to vendor profile)
 * - Stored in Customer metadata to link account to vendor profile
 * - Stored in Product/Order metadata to associate objects with vendor
 */
export const METADATA_KEYS = {
  /** Vendor profile id – links Customer/Product/Order to vendor */
  VENDOR_ID: "vendor.id",
  /** Default collection flag (stored in collection metadata) */
  VENDOR_DEFAULT_COLLECTION: "vendor.default_collection",
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
