"use server";

import { cookies } from "next/headers";

import { saleorAuthClient } from "@nimara/infrastructure/public/saleor/auth/client";

import { COOKIE_KEY } from "@/config";

export async function handleLogout() {
  saleorAuthClient().signOut();
  cookies().delete(COOKIE_KEY.accessToken);
  cookies().delete(COOKIE_KEY.refreshToken);
  cookies().delete(COOKIE_KEY.checkoutId);
}

export async function setAccessToken(value: string) {
  cookies().set(COOKIE_KEY.accessToken, value, {
    httpOnly: true,
  });
}

export async function setRefreshToken(value: string) {
  cookies().set(COOKIE_KEY.refreshToken, value, {
    httpOnly: true,
  });
}
