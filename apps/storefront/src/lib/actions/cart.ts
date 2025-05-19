"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/lib/cache";
import { storefrontLogger } from "@/services/logging";

/**
 * Revalidates the checkout cache.
 * @param id - The checkout ID
 */
export const revalidateCheckout = async (id: string) => {
  storefrontLogger.debug("Revalidating checkout cache", { id });

  revalidateTag(`CHECKOUT:${id}`);
};

export const setCheckoutIdCookie = async (id: string) => {
  storefrontLogger.debug("Setting checkout ID cookie", { id });

  (await cookies()).set(COOKIE_KEY.checkoutId, id, {
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const getCheckoutIdCookie = async () => {
  storefrontLogger.debug("Getting checkout ID cookie");

  // Get the checkout ID from the cookie
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  // If the checkout ID is not found, return null
  if (!checkoutId) {
    storefrontLogger.debug("Checkout ID cookie not found");

    return null;
  }

  return checkoutId;
};

export const deleteCheckoutIdCookie = async () => {
  storefrontLogger.debug("Deleting checkout ID cookie");
  // Delete the checkout ID cookie

  (await cookies()).delete(COOKIE_KEY.checkoutId);
};
