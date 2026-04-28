"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  COOKIE_KEY,
  COOKIE_MAX_AGE,
  MARKETPLACE_NO_VENDOR_BUCKET,
} from "@/config";
import { revalidateTag } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";

const CHECKOUT_COOKIE_VERSION = "1";

/**
 * Checkout cookie payload structure.
 * Always uses a versioned record format for both single and multi-vendor modes.
 *
 * @internal
 */
interface CheckoutCookiePayload {
  /** Record mapping vendor IDs to their checkout IDs */
  checkouts: Record<string, string>;
  /** Version number for future schema evolution */
  v: string;
}

// =============================================================================
// PRIVATE HELPERS
// =============================================================================

/**
 * Sanitizes and validates a checkout ID string.
 *
 * @internal
 * @param value - The value to validate
 * @returns Trimmed checkout ID or null if invalid
 */
const sanitizeCheckoutId = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

/**
 * Normalizes vendor key to a consistent format.
 * Null or empty keys are converted to the default marketplace bucket.
 *
 * @internal
 * @param vendorKey - The vendor key to normalize
 * @returns Normalized vendor key (never null)
 */
const normalizeVendorKey = (vendorKey?: string | null): string => {
  const normalized = vendorKey?.trim();

  return normalized && normalized.length > 0
    ? normalized
    : MARKETPLACE_NO_VENDOR_BUCKET;
};

/**
 * Serializes a checkout ID record into a JSON cookie value.
 *
 * @internal
 * @param checkoutIdsByVendor - Record of vendor IDs to checkout IDs
 * @returns JSON string representation
 */
const serializeCheckoutCookie = (
  checkoutIdsByVendor: Record<string, string>,
): string =>
  JSON.stringify({
    v: CHECKOUT_COOKIE_VERSION,
    checkouts: checkoutIdsByVendor,
  } satisfies CheckoutCookiePayload);

/**
 * Reads the checkout ID cookie value from the request cookies.
 *
 * @internal
 * @returns The raw cookie value or undefined
 */
const readCheckoutCookie = async (): Promise<string | undefined> => {
  return (await cookies()).get(COOKIE_KEY.checkout)?.value;
};

// =============================================================================
// PUBLIC GETTERS
// =============================================================================

/**
 * Retrieves the checkout ID for a specific vendor.
 * Automatically handles both single-vendor and multi-vendor cookie formats.
 *
 * When marketplace is disabled, treats the entire checkout ID record as a
 * single default vendor. When marketplace is enabled, retrieves the specific
 * vendor's checkout ID.
 *
 * Handles graceful fallback for legacy string-format cookies.
 *
 * @param vendorId - The vendor ID to retrieve. Optional in single-vendor mode.
 * @returns The checkout ID string, or null if not found
 *
 * @example
 * // Single-vendor mode
 * const checkoutId = await getCheckoutId();
 *
 * @example
 * // Multi-vendor mode
 * const vendorCheckoutId = await getCheckoutId("vendor-123");
 */
export const getCheckoutId = async (
  vendorId?: string | null,
): Promise<string | null> => {
  const cookieValue = await readCheckoutCookie();

  if (!cookieValue) {
    return null;
  }

  const key = normalizeVendorKey(vendorId);

  try {
    const parsed = JSON.parse(cookieValue) as CheckoutCookiePayload;

    return parsed.checkouts?.[key] ?? null;
  } catch {
    // Graceful fallback for legacy string format
    // If parsing fails and requesting default vendor, return the string as-is
    return key === MARKETPLACE_NO_VENDOR_BUCKET ? cookieValue : null;
  }
};

/**
 * Retrieves all checkout IDs as a record of vendor IDs to checkout IDs.
 *
 * In single-vendor mode, returns a record with a single default vendor key.
 * In multi-vendor mode, returns all vendor checkouts.
 *
 * Handles graceful fallback for legacy string-format cookies.
 *
 * @returns Record mapping vendor IDs to checkout IDs, or null if not found
 *
 * @example
 * const allCheckouts = await getAllCheckoutIds();
 * // Returns: { "vendor-1": "chkt_123", "vendor-2": "chkt_456" }
 */
export const getAllCheckoutIds = async (): Promise<Record<
  string,
  string
> | null> => {
  const cookieValue = await readCheckoutCookie();

  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookieValue) as CheckoutCookiePayload | null;

    return parsed?.checkouts ?? null;
  } catch {
    // Graceful fallback for legacy string format
    return { [MARKETPLACE_NO_VENDOR_BUCKET]: cookieValue };
  }
};

/**
 * Alias for getAllCheckoutIds when marketplace mode is explicitly needed.
 * Use this when the code path is specific to multi-vendor flows.
 *
 * @returns Record mapping vendor IDs to checkout IDs, or null if not found
 *
 * @deprecated Use {@link getAllCheckoutIds} instead
 */
export const getCheckoutIdsByVendor = getAllCheckoutIds;

// =============================================================================
// PUBLIC SETTERS
// =============================================================================

/**
 * Sets a raw cookie value for the checkout ID cookie.
 *
 * This is the low-level setter used by higher-level functions.
 * Respects Next.js server cookie security rules (httpOnly, secure in production, sameSite).
 *
 * @param value - The serialized JSON value to set in the cookie
 *
 * @internal Use setCheckoutId or setCheckoutIdForVendor instead
 */
export const setCheckoutCookieRaw = async (value: string): Promise<void> => {
  const cookieStorage = await cookies();

  cookieStorage.set(COOKIE_KEY.checkout, value, {
    path: "/",
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

/**
 * Sets the checkout ID for a specific vendor, updating the cookie.
 *
 * Automatically normalizes vendor keys and checkout IDs.
 * Merges with existing vendor checkouts in the cookie.
 * Deletes the cookie if no valid checkout IDs remain after normalization.
 *
 * Behavior depends on NEXT_PUBLIC_MARKETPLACE_ENABLED:
 * - When disabled: Sets the single-vendor checkout ID
 * - When enabled: Sets the checkout ID for the specified vendor
 *
 * @param data - Object containing the checkout ID and optional vendor key
 * @param data.checkoutId - The checkout ID to store
 * @param data.vendorKey - The vendor ID (optional, defaults to default bucket)
 *
 * @example
 * // Single-vendor mode
 * await setCheckoutId({ checkoutId: "chkt_123" });
 *
 * @example
 * // Multi-vendor mode
 * await setCheckoutId({ checkoutId: "chkt_456", vendorKey: "vendor-1" });
 */
export const setCheckoutId = async (data: {
  checkoutId: string;
  vendorKey?: string | null;
}): Promise<void> => {
  const allCheckoutIds = await getAllCheckoutIds();
  const normalizedVendorKey = normalizeVendorKey(data.vendorKey);

  const updatedCheckoutIds: Record<string, string> = {
    ...(allCheckoutIds ?? {}),
    [normalizedVendorKey]: data.checkoutId,
  };

  await setMarketplaceCheckoutIdsCookie(updatedCheckoutIds);
};

/**
 * Alias for setCheckoutId for backward compatibility with single-vendor API.
 *
 * @param id - The checkout ID to store
 *
 * @deprecated Use {@link setCheckoutId} instead
 */
export const setCheckoutIdCookie = async (id: string): Promise<void> => {
  await setCheckoutId({ checkoutId: id });
};

/**
 * Alias for setCheckoutId when explicitly setting for a vendor in marketplace mode.
 *
 * @param data - Object containing checkout ID and optional vendor key
 *
 * @deprecated Use {@link setCheckoutId} instead
 */
export const setCheckoutIdForVendor = async (data: {
  checkoutId: string;
  vendorKey?: string | null;
}): Promise<void> => {
  await setCheckoutId(data);
};

/**
 * Internal function to set the marketplace checkout IDs cookie.
 *
 * Normalizes all vendor keys and checkout IDs, filters invalid values,
 * and updates the cookie. Deletes the cookie if no valid IDs remain.
 *
 * @internal
 * @param checkoutIdsByVendor - Record of vendor IDs to checkout IDs
 */
export const setMarketplaceCheckoutIdsCookie = async (
  checkoutIdsByVendor: Record<string, string>,
): Promise<void> => {
  const normalizedCheckouts = Object.fromEntries(
    Object.entries(checkoutIdsByVendor)
      .map(([vendorKey, checkoutId]) => [
        normalizeVendorKey(vendorKey),
        sanitizeCheckoutId(checkoutId),
      ])
      .filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].length > 0,
      ),
  );

  // If no valid checkout IDs remain after normalization, delete the cookie
  if (Object.keys(normalizedCheckouts).length === 0) {
    const cookieStorage = await cookies();

    cookieStorage.delete(COOKIE_KEY.checkout);

    return;
  }

  // Set the new checkout IDs in the cookie
  await setCheckoutCookieRaw(serializeCheckoutCookie(normalizedCheckouts));
};

/**
 * Deletes the checkout ID cookie.
 *
 * This is a low-level setter. Prefer using API route handlers for deletion
 * to avoid server action overhead.
 *
 * @example
 * // Via server action (less ideal)
 * await deleteCheckoutIdCookie();
 *
 * @example
 * // Via API route handler (preferred)
 * // POST /api/cookies/delete with body: { cookieKey: "checkout" }
 */
export const deleteCheckoutIdCookie = async (): Promise<void> => {
  const cookieStorage = await cookies();

  cookieStorage.delete(COOKIE_KEY.checkout);
};

/**
 * Removes a specific vendor's checkout ID from the cookie.
 *
 * When marketplace is enabled, removes the checkout for a specific vendor.
 * Deletes the entire cookie if no valid checkouts remain.
 *
 * Has no effect if the vendor key is not found in the cookie.
 *
 * @param vendorKey - The vendor ID whose checkout should be removed
 *
 * @example
 * await removeCheckoutIdForVendor("vendor-1");
 */
export const removeCheckoutIdForVendor = async (
  vendorKey?: string | null,
): Promise<void> => {
  const allCheckoutIds = await getAllCheckoutIds();

  if (!allCheckoutIds) {
    return;
  }

  const normalizedKey = normalizeVendorKey(vendorKey);
  const { [normalizedKey]: _, ...remaining } = allCheckoutIds;

  await setMarketplaceCheckoutIdsCookie(remaining);
};

// =============================================================================
// CACHE MANAGEMENT
// =============================================================================

/**
 * Triggers cache revalidation for cart and checkout pages.
 *
 * Should be called after any cart mutation to ensure the UI reflects
 * the current server state.
 *
 * Revalidates:
 * - The specific checkout's cache tag
 * - The cart page
 * - The checkout page
 *
 * @param checkoutId - The checkout ID to revalidate
 *
 * @example
 * // After adding an item to cart
 * revalidateCart(checkoutId);
 */
export const revalidateCart = async (checkoutId: string): Promise<void> => {
  revalidateTag(`CHECKOUT:${checkoutId}`);
  revalidatePath(paths.cart.asPath());
  revalidatePath(paths.checkout.asPath());
};

// =============================================================================
// MIGRATION & COMPATIBILITY
// =============================================================================

/**
 * Checks if the checkout cookie exists and is valid.
 *
 * @returns true if a checkout ID cookie is present
 */
export const hasCheckoutId = async (): Promise<boolean> => {
  const cookieValue = await readCheckoutCookie();

  return cookieValue !== undefined;
};

/**
 * Gets the active checkout IDs for the current mode.
 *
 * In single-vendor mode: Returns array with one checkout ID
 * In multi-vendor mode: Returns array with all vendor checkout IDs
 *
 * @returns Array of active checkout IDs
 *
 * @example
 * const activeCheckouts = await getActiveCheckoutIds();
 * // Single-vendor: ["chkt_123"]
 * // Multi-vendor: ["chkt_123", "chkt_456"]
 */
export const getActiveCheckoutIds = async (): Promise<string[]> => {
  const allCheckoutIds = await getAllCheckoutIds();

  return Object.values(allCheckoutIds ?? {}).filter(Boolean);
};
