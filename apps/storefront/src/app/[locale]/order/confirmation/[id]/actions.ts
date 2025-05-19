"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY } from "@/config";

export const clearCheckoutCookieAction = async () => {
  const nextCookies = await cookies();

  console.debug("Clearing checkout ID cookie. `clearCheckoutCookieAction`");

  nextCookies.delete(COOKIE_KEY.checkoutId);
};
