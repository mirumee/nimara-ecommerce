"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY } from "@/config";
import { storefrontLogger } from "@/services/logging";

export const clearCheckoutCookieAction = async () => {
  const nextCookies = await cookies();

  storefrontLogger.debug("Clearing checkout ID cookie on confirmation page.");

  nextCookies.delete(COOKIE_KEY.checkoutId);
};
