"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY } from "@/config";

export const clearCheckoutCookieAction = async () => {
  const nextCookies = await cookies();

  nextCookies.delete(COOKIE_KEY.checkoutId);
};
