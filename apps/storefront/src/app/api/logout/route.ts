import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_KEY } from "@/config";
import { LOCALE_CHANNEL_MAP } from "@/regions/config";

export async function GET(request: NextRequest) {
  const nextLocale = request.cookies.get(COOKIE_KEY.locale)?.value;

  const market =
    LOCALE_CHANNEL_MAP[nextLocale as keyof typeof LOCALE_CHANNEL_MAP] ?? "us";

  const response = NextResponse.redirect(
    new URL(`/${market}/sign-in`, request.url),
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}
