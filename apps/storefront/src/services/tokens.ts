import { cookies } from "next/headers";

import { type BaseError } from "@nimara/domain/objects/Error";
import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { COOKIE_KEY } from "@/config";

/**
 * Gets the access token from cookies.
 * This is a server-only function.
 */
export const getAccessToken = async () =>
  (await cookies()).get(COOKIE_KEY.accessToken)?.value;

/**
 * Gets the access token from cookies, failing when the caller is not authenticated.
 * Use it in operations that require an access token, so the missing token is
 * reported as a Result instead of being passed further as `undefined`.
 */
export const requireAccessToken = async (): AsyncResult<string> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR",
        field: undefined,
      } satisfies BaseError,
    ]);
  }

  return ok(accessToken);
};

/**
 * Gets the refresh token from cookies.
 * This is a server-only function.
 */
export const getRefreshToken = async () =>
  (await cookies()).get(COOKIE_KEY.refreshToken)?.value;
