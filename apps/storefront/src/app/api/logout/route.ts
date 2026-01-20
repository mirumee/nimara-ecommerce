import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_KEY } from "@/config";
import { LOCALE_CHANNEL_MAP } from "@/foundation/regions/config";
import { type SupportedLocale } from "@/foundation/regions/types";

export async function GET(request: NextRequest) {
  const nextLocale = request.cookies.get(COOKIE_KEY.locale)?.value;

  // TODO why this "us" magic string
  const market = LOCALE_CHANNEL_MAP[nextLocale as SupportedLocale] ?? "us";

  const response = NextResponse.redirect(
    new URL(`/${market}/sign-in`, request.url),
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}
