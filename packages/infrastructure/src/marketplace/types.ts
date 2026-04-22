import type { VendorProfile } from "@nimara/domain/objects/Marketplace";
import { type AsyncResult } from "@nimara/domain/objects/Result";

/**
 * Service for marketplace operations.
 *
 */
export interface MarketplaceService {
  /**
   * Gets a vendor profile by ID.
   * @param id - ID of the vendor.
   * @returns A promise that resolves to the vendor profile.
   */
  vendorGetByID: (id: string) => AsyncResult<VendorProfile>;
  /**
   * Gets a vendor profile by slug.
   * @param slug - Slug of the vendor.
   * @returns A promise that resolves to the vendor profile.
   */
  vendorGetBySlug: (slug: string) => AsyncResult<VendorProfile>;
}
