"use server";

import { cookies } from "next/headers";

import { saleorAuthClient } from "@nimara/infrastructure/public/saleor/auth/client";

import { COOKIE_KEY } from "@/config";

export async function handleLogout() {
  saleorAuthClient().signOut();
  const cookieStore = await cookies();

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
