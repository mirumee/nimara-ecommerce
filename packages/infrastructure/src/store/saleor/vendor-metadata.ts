/** Saleor product metadata key for vendor ID (marketplace). */
export const VENDOR_ID_METADATA_KEY = "vendor.id";

/**
 * Extracts vendor ID from Saleor product/line metadata.
 * @param metadata - metadata array (e.g. product.metadata or line.product.metadata)
 * @returns vendor ID string or null
 */
export function getVendorIdFromMetadata(
  metadata: Array<{ key: string; value: string }> | null | undefined,
): string | null {
  return metadata?.find((m) => m.key === VENDOR_ID_METADATA_KEY)?.value ?? null;
}
