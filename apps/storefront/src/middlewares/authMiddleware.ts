import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import { COOKIE_KEY } from "@/config";
import { getAuthService } from "@/services/auth";

import { type CustomMiddleware } from "./chain";

const PROTECTED_ROUTES = ["/account"];

export function authMiddleware(middleware: CustomMiddleware) {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse,
  ) => {
    const accessToken = (await cookies()).get(COOKIE_KEY.accessToken)?.value;
    const redirectToLogin = NextResponse.redirect(
      new URL("/sign-in", request.url),
    );
    let modifiedResponse: NextResponse = response;

    if (!accessToken) {
      if (
        PROTECTED_ROUTES.some((route) =>
          request.nextUrl.pathname.includes(route),
        )
      ) {
        modifiedResponse = redirectToLogin;
      }

      return middleware(request, event, modifiedResponse);
    }

    const decodedAccessToken = decodeJwt(accessToken);

    if (Date.now() < decodedAccessToken.exp! * 1000) {
      return middleware(request, event, modifiedResponse);
    }

    const refreshToken = (await cookies()).get(COOKIE_KEY.refreshToken)?.value;

    if (!refreshToken) {
      modifiedResponse = redirectToLogin;
      modifiedResponse.cookies.delete(COOKIE_KEY.accessToken);

      return middleware(request, event, modifiedResponse);
    }

    const authService = await getAuthService();
    const resultTokenRefresh = await authService.tokenRefresh({
      refreshToken,
    });

    if (!resultTokenRefresh.ok || !resultTokenRefresh.data.refreshToken) {
      modifiedResponse = redirectToLogin;
      modifiedResponse.cookies.delete(COOKIE_KEY.accessToken);
      modifiedResponse.cookies.delete(COOKIE_KEY.refreshToken);

      return middleware(request, event, modifiedResponse);
    }

    modifiedResponse.cookies.set(
      COOKIE_KEY.accessToken,
      resultTokenRefresh.data.refreshToken,
      {
        httpOnly: true,
        sameSite: "strict",
      },
    );

    return middleware(request, event, response);
  };
}
