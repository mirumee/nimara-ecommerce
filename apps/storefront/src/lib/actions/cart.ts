"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/lib/cache";
import { storefrontLogger } from "@/services/logging";

/**
 * Revalidates the checkout cache.
 * @param id - The checkout ID
 * @returns void
 */
export const revalidateCheckout = async (id: string) => {
  storefrontLogger.debug("Revalidating checkout cache.", { id });

  revalidateTag(`CHECKOUT:${id}`);
};

/**
 * Saves the checkout ID to a cookie.
 * @param id - The checkout ID
 * @returns void
 */
export const setCheckoutIdCookie = async (id: string) => {
  storefrontLogger.debug("Setting checkout ID cookie.", { id });

  (await cookies()).set(COOKIE_KEY.checkoutId, id, {
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

/**
 * Gets the checkout ID from the cookie.
 * @returns The checkout ID from the cookie, or null if not found.
 */
export const getCheckoutId = async () => {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  // If the checkout ID is not found, return null
  if (!checkoutId) {
    storefrontLogger.debug("Checkout ID cookie not found.");

    return null;
  }

  storefrontLogger.debug("Checkout ID cookie found.", { checkoutId });

  return checkoutId;
};
