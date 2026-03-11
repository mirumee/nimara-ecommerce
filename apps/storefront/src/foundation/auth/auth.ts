"use server";

import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";

import { createSaleorAuthClientFromConfig } from "@nimara/infrastructure/auth/client";

import { COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export async function handleLogout() {
  (
    await createSaleorAuthClientFromConfig({
      saleorApiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    })
  ).signOut();

  Sentry.setUser(null);

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
