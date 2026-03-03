"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";
import { getStorefrontLogger } from "@/services/lazy-logging";

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
  const cookieStorage = await cookies();

  cookieStorage.set(COOKIE_KEY.checkoutId, id, {
    path: "/",
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

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

/**
 * Gets the checkout ID from the cookie.
 * @returns The checkout ID from the cookie, or null if not found.
 */
export const getCheckoutId = async (): Promise<string | null> => {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  // If the checkout ID is not found, return null
  if (!checkoutId) {
    const storefrontLogger = await getStorefrontLogger();

    storefrontLogger.debug("Checkout ID cookie not found.");

    return null;
  }

  return checkoutId;
};
