import { cookies } from "next/headers";

import { COOKIE_KEY } from "@/config";

/**
 * Gets the access token from cookies.
 * This is a server-only function.
 */
export const getAccessToken = async () =>
  (await cookies()).get(COOKIE_KEY.accessToken)?.value;

/**
 * Gets the refresh token from cookies.
 * This is a server-only function.
 */
export const getRefreshToken = async () =>
  (await cookies()).get(COOKIE_KEY.refreshToken)?.value;
