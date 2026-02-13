/**
 * Metadata keys used in Saleor
 *
 * Vendor identification:
 * - vendor.id = UUID (canonical vendor identifier, from generateVendorId())
 * - Stored in User metadata to link customer account to vendor profile
 * - Stored in Product/Order metadata to associate with vendor
 */
export const METADATA_KEYS = {
  /** Vendor ID (UUID) – canonical vendor identifier; links User/Product/Order to vendor */
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
