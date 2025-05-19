"use server";

import { cookies } from "next/headers";

import { saleorAuthClient } from "@nimara/infrastructure/auth/client";

import { COOKIE_KEY } from "@/config";

export async function handleLogout() {
  (await saleorAuthClient()).signOut();
  const cookieStore = await cookies();

  console.debug("Clearing auth and checkout cookies. `handleLogout`");

  cookieStore.delete(COOKIE_KEY.accessToken);
  cookieStore.delete(COOKIE_KEY.refreshToken);
  cookieStore.delete(COOKIE_KEY.checkoutId);
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
