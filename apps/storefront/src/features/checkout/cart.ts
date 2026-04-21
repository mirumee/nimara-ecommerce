"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { MARKETPLACE_NO_VENDOR_BUCKET } from "@/features/checkout/constants";
import { revalidateTag } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";
import { getStorefrontLogger } from "@/services/lazy-logging";

const MARKETPLACE_COOKIE_VERSION = 1;

type MarketplaceCheckoutCookieV1 = {
  checkouts: Record<string, string>;
  v: number;
};

const isMarketplaceEnabled =
  process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false";

const sanitizeCheckoutId = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

const normalizeVendorKey = (vendorKey: string | null | undefined): string => {
  const normalized = vendorKey?.trim();

  if (!normalized) {
    return MARKETPLACE_NO_VENDOR_BUCKET;
  }

  return normalized;
};

const parseCheckoutCookie = (
  cookieValue: string | undefined,
): {
  checkoutIdsByVendor: Record<string, string>;
  legacyCheckoutId: string | null;
} => {
  const normalizedCookieValue = cookieValue?.trim();

  if (!normalizedCookieValue) {
    return {
      checkoutIdsByVendor: {},
      legacyCheckoutId: null,
    };
  }

  try {
    const parsed = JSON.parse(
      normalizedCookieValue,
    ) as MarketplaceCheckoutCookieV1 | null;

    const checkouts = parsed?.checkouts;

    if (
      typeof parsed?.v === "number" &&
      parsed.v === MARKETPLACE_COOKIE_VERSION &&
      typeof checkouts === "object" &&
      checkouts !== null
    ) {
      const sanitizedCheckouts = Object.fromEntries(
        Object.entries(checkouts)
          .map(([vendorKey, checkoutId]) => [
            normalizeVendorKey(vendorKey),
            sanitizeCheckoutId(checkoutId),
          ])
          .filter(
            (entry): entry is [string, string] =>
              typeof entry[1] === "string" && entry[1].length > 0,
          ),
      );

      return {
        checkoutIdsByVendor: sanitizedCheckouts,
        legacyCheckoutId: null,
      };
    }
  } catch {
    // Ignore parse errors and fallback to legacy string handling.
  }

  return {
    checkoutIdsByVendor: {},
    legacyCheckoutId: sanitizeCheckoutId(normalizedCookieValue),
  };
};

const serializeMarketplaceCheckoutCookie = (
  checkoutIdsByVendor: Record<string, string>,
): string =>
  JSON.stringify({
    v: MARKETPLACE_COOKIE_VERSION,
    checkouts: checkoutIdsByVendor,
  } satisfies MarketplaceCheckoutCookieV1);

const getParsedCheckoutCookie = async () => {
  const cookieStorage = await cookies();
  const cookieValue = cookieStorage.get(COOKIE_KEY.checkoutId)?.value;

  return parseCheckoutCookie(cookieValue);
};

const setCheckoutCookieRaw = async (value: string) => {
  const cookieStorage = await cookies();

  cookieStorage.set(COOKIE_KEY.checkoutId, value, {
    path: "/",
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

/**
 * Revalidates the cart/checkout cache.
 * @param id - The checkout ID
 * @returns void
 */
export const revalidateCart = async (id: string): Promise<void> => {
  revalidateTag(`CHECKOUT:${id}`);
  revalidatePath(paths.cart.asPath());
  revalidatePath(paths.checkout.asPath());
};

/**
 * Saves the checkout ID to a cookie.
 * @param id - The checkout ID
 * @returns void
 */
export const setCheckoutIdCookie = async (id: string) => {
  await setCheckoutCookieRaw(id);
  const cookieStorage = await cookies();
  const checkoutIdCookie = cookieStorage.get(COOKIE_KEY.checkoutId);

  const storefrontLogger = await getStorefrontLogger();

  if (checkoutIdCookie) {
    storefrontLogger.debug("Checkout ID cookie set successfully.", {
      checkoutId: checkoutIdCookie.value,
    });
  } else {
    storefrontLogger.error("Failed to set checkout ID cookie.", {
      checkoutId: id,
    });
  }
};

export const setMarketplaceCheckoutIdsCookie = async (
  checkoutIdsByVendor: Record<string, string>,
) => {
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

  if (Object.keys(normalizedCheckouts).length === 0) {
    return clearCheckoutCookie();
  }

  await setCheckoutCookieRaw(
    serializeMarketplaceCheckoutCookie(normalizedCheckouts),
  );
};

export const setCheckoutIdForVendor = async (
  vendorKey: string | null | undefined,
  checkoutId: string,
) => {
  const { checkoutIdsByVendor, legacyCheckoutId } =
    await getParsedCheckoutCookie();
  const currentMarketplaceState =
    Object.keys(checkoutIdsByVendor).length > 0
      ? checkoutIdsByVendor
      : legacyCheckoutId
        ? {
            [MARKETPLACE_NO_VENDOR_BUCKET]: legacyCheckoutId,
          }
        : {};

  currentMarketplaceState[normalizeVendorKey(vendorKey)] = checkoutId;

  await setMarketplaceCheckoutIdsCookie(currentMarketplaceState);
};

export const getCheckoutIdsByVendor = async (): Promise<
  Record<string, string>
> => {
  const { checkoutIdsByVendor, legacyCheckoutId } =
    await getParsedCheckoutCookie();

  if (Object.keys(checkoutIdsByVendor).length > 0) {
    return checkoutIdsByVendor;
  }

  if (legacyCheckoutId) {
    return {
      [MARKETPLACE_NO_VENDOR_BUCKET]: legacyCheckoutId,
    };
  }

  return {};
};

export const getCheckoutIdForVendor = async (
  vendorKey: string | null | undefined,
): Promise<string | null> => {
  const checkoutIdsByVendor = await getCheckoutIdsByVendor();

  return checkoutIdsByVendor[normalizeVendorKey(vendorKey)] ?? null;
};

export const getCheckoutIds = async (): Promise<string[]> => {
  if (!isMarketplaceEnabled) {
    const checkoutId = await getCheckoutId();

    return checkoutId ? [checkoutId] : [];
  }

  const checkoutIdsByVendor = await getCheckoutIdsByVendor();

  return [...new Set(Object.values(checkoutIdsByVendor))];
};

/**
 * Gets the checkout ID from the cookie.
 * @returns The checkout ID from the cookie, or null if not found.
 */
export const getCheckoutId = async (): Promise<string | null> => {
  const { checkoutIdsByVendor, legacyCheckoutId } =
    await getParsedCheckoutCookie();

  const checkoutId =
    legacyCheckoutId ?? Object.values(checkoutIdsByVendor)[0] ?? null;

  // If the checkout ID is not found, return null
  if (!checkoutId) {
    const storefrontLogger = await getStorefrontLogger();

    storefrontLogger.debug("Checkout ID cookie not found.");

    return null;
  }

  return checkoutId;
};

export const clearCheckoutCookie = async () => {
  const cookieStorage = await cookies();

  cookieStorage.delete(COOKIE_KEY.checkoutId);
};
