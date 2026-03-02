"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { serverEnvs } from "@/envs/server";
import { revalidateTag } from "@/lib/cache";
import { getStorefrontLogger } from "@/services/lazy-logging";

export type CheckoutVendorMap = Record<string, string>;

const getCookieOptions = () => ({
  path: "/",
  maxAge: COOKIE_MAX_AGE.checkout,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
});

const parseCheckoutVendorMap = (raw: string | undefined): CheckoutVendorMap => {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([vendorId, checkoutId]) =>
          !!vendorId &&
          typeof vendorId === "string" &&
          typeof checkoutId === "string" &&
          !!checkoutId,
      ),
    );
  } catch {
    return {};
  }
};

const getPrimaryCheckoutIdFromMap = (map: CheckoutVendorMap) =>
  Object.values(map)[0] ?? null;

/**
 * Revalidates the cart/checkout cache.
 * @param id - The checkout ID
 * @returns void
 */
export const revalidateCart = async (id: string): Promise<void> => {
  const storefrontLogger = await getStorefrontLogger();

  storefrontLogger.debug("Revalidating checkout cache.", { id });

  revalidateTag(`CHECKOUT:${id}`);
};

/**
 * Saves the checkout ID to a cookie.
 * @param id - The checkout ID
 * @returns void
 */
export const setCheckoutIdCookie = async (id: string) => {
  const cookieStorage = await cookies();

  cookieStorage.set(COOKIE_KEY.checkoutId, id, getCookieOptions());

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

export const setCheckoutVendorMapCookie = async (map: CheckoutVendorMap) => {
  const cookieStorage = await cookies();

  cookieStorage.set(
    COOKIE_KEY.checkoutVendorMap,
    JSON.stringify(map),
    getCookieOptions(),
  );

  const primaryCheckoutId = getPrimaryCheckoutIdFromMap(map);

  if (primaryCheckoutId) {
    cookieStorage.set(
      COOKIE_KEY.checkoutId,
      primaryCheckoutId,
      getCookieOptions(),
    );
  } else {
    cookieStorage.delete(COOKIE_KEY.checkoutId);
  }
};

export const getCheckoutVendorMap = async (): Promise<CheckoutVendorMap> => {
  const rawMap = (await cookies()).get(COOKIE_KEY.checkoutVendorMap)?.value;

  return parseCheckoutVendorMap(rawMap);
};

export const clearCheckoutSessionCookies = async () => {
  const cookieStorage = await cookies();

  cookieStorage.delete(COOKIE_KEY.checkoutId);
  cookieStorage.delete(COOKIE_KEY.checkoutVendorMap);
};

export const getMarketplaceCheckoutIds = async (): Promise<string[]> => {
  const map = await getCheckoutVendorMap();

  return [...new Set(Object.values(map))];
};

export const getCheckoutIdForVendor = async (vendorId: string) => {
  const map = await getCheckoutVendorMap();

  return map[vendorId] ?? null;
};

export const setVendorCheckoutId = async ({
  checkoutId,
  vendorId,
}: {
  checkoutId: string;
  vendorId: string;
}) => {
  const map = await getCheckoutVendorMap();
  const nextMap: CheckoutVendorMap = {
    ...map,
    [vendorId]: checkoutId,
  };

  await setCheckoutVendorMapCookie(nextMap);
};

/**
 * Gets the checkout ID from the cookie.
 * @returns The checkout ID from the cookie, or null if not found.
 */
export const getCheckoutId = async (): Promise<string | null> => {
  if (serverEnvs.MARKETPLACE_MODE) {
    const marketplaceIds = await getMarketplaceCheckoutIds();

    if (marketplaceIds.length > 0) {
      return marketplaceIds[0];
    }
  }

  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  // If the checkout ID is not found, return null
  if (!checkoutId) {
    const storefrontLogger = await getStorefrontLogger();

    storefrontLogger.debug("Checkout ID cookie not found.");

    return null;
  }

  return checkoutId;
};
