"use server";

import { cookies } from "next/headers";

import { saleorAuthClient } from "@nimara/infrastructure/auth/client";

import { COOKIE_KEY } from "@/config";
import { storefrontLogger } from "@/services/logging";

export async function handleLogout() {
  (await saleorAuthClient()).signOut();

  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_KEY.accessToken);
  cookieStore.delete(COOKIE_KEY.refreshToken);
  cookieStore.delete(COOKIE_KEY.checkoutId);

  storefrontLogger.debug("Cleared auth and checkout cookies after logout.");
}

export async function setAccessToken(value: string) {
  (await cookies()).set(COOKIE_KEY.accessToken, value, {
    httpOnly: true,
  });
}

export async function setRefreshToken(value: string) {
  (await cookies()).set(COOKIE_KEY.refreshToken, value, {
    httpOnly: true,
  });
}
