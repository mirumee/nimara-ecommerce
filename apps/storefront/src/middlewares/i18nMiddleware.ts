import { type NextFetchEvent, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { COOKIE_KEY } from "@/config";
import { routing } from "@/i18n/routing";
import { LOCALE_CHANNEL_MAP } from "@/regions/config";
import { type Locale } from "@/regions/types";

import type { CustomMiddleware } from "./chain";

const NEXT_LOCALE = "NEXT_LOCALE";

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const nextLocaleCookie = request.cookies.get(NEXT_LOCALE)?.value ?? "en-GB";
    const channelId = request.nextUrl.pathname.split("/")[1];
    const locale =
      Object.keys(LOCALE_CHANNEL_MAP).find(
        (key) => LOCALE_CHANNEL_MAP[key as Locale] === channelId,
      ) ?? nextLocaleCookie;

    if (locale !== nextLocaleCookie) {
      request.cookies.delete(COOKIE_KEY.checkoutId);
    }

    const handleI18nRouting = createIntlMiddleware(routing);

    const response = handleI18nRouting(request);

    if (locale !== nextLocaleCookie) {
      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    response.cookies.set(NEXT_LOCALE, locale);

    return middleware(request, event, response);
  };
}
