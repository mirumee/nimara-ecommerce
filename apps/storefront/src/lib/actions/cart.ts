"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/lib/cache";
import { storefrontLogger } from "@/services/logging";

/**
 * Revalidates the cart/checkout cache.
 * @param id - The checkout ID
 * @returns void
 */
export const revalidateCart = async (id: string): Promise<void> => {
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

  cookieStorage.set(COOKIE_KEY.checkoutId, id, {
    path: "/",
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  const checkoutIdCookie = cookieStorage.get(COOKIE_KEY.checkoutId);

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

/**
 * Gets the checkout ID from the cookie.
 * @returns The checkout ID from the cookie, or null if not found.
 */
export const getCheckoutId = async (): Promise<string | null> => {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  // If the checkout ID is not found, return null
  if (!checkoutId) {
    storefrontLogger.debug("Checkout ID cookie not found.");

    return null;
  }

  return checkoutId;
};
