"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/lib/cache";

/**
 * Revalidates the checkout cache.
 * @param id - The checkout ID
 */
export const revalidateCheckout = async (id: string) => {
  revalidateTag(`CHECKOUT:${id}`);
};

export const setCheckoutIdCookie = async (id: string) => {
  (await cookies()).set(COOKIE_KEY.checkoutId, id, {
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const getCheckoutIdCookie = async () =>
  (await cookies()).get(COOKIE_KEY.checkoutId)?.value ?? null;

export const deleteCheckoutIdCookie = async () =>
  (await cookies()).delete(COOKIE_KEY.checkoutId);
