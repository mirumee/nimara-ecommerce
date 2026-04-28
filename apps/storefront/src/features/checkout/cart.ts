"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";
import { getStorefrontLogger } from "@/services/lazy-logging";

/**
 * Stores the given checkout ID in an HTTP-only cookie for the current user session.
 * Overwrites any existing checkout ID cookie.
 *
 * @param id - The checkout ID to persist as a cookie.
 * @returns void
 */
export const setCheckoutIdCookie = async (id: string): Promise<void> => {
  const cookieStorage = await cookies();

  cookieStorage.set(COOKIE_KEY.checkout, id, {
    path: "/",
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

/**
 * Triggers cache revalidation for the user's cart and checkout pages based on the given checkout ID.
 *
 * This should be called after any cart or checkout mutation to ensure up-to-date UI state.
 *
 * @param id - The Saleor checkout ID whose associated cache should be invalidated.
 */
export const revalidateCart = async (id: string): Promise<void> => {
  revalidateTag(`CHECKOUT:${id}`);
  revalidatePath(paths.cart.asPath());
  revalidatePath(paths.checkout.asPath());
};
