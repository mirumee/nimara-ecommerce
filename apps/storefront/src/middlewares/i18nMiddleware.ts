import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { COOKIE_KEY } from "@/config";
import { localePrefixes, routing } from "@/i18n/routing";
import {
  DEFAULT_LOCALE,
  type Locale,
  SUPPORTED_LOCALES,
} from "@/regions/types";

import type { CustomMiddleware } from "./chain";

const NEXT_LOCALE = "NEXT_LOCALE";

function getLocale(request: NextRequest) {
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? undefined,
    },
  }).languages();

  console.log("[i18nMiddleware] Detected languages:", languages);

  return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);
}

export function i18nMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request: NextRequest, event: NextFetchEvent) => {
    try {
      console.log(
        "[i18nMiddleware] Incoming request:",
        request.nextUrl.pathname,
      );

      const preferredLocale = getLocale(request);

      console.log("[i18nMiddleware] Preferred locale:", preferredLocale);

      const nextLocaleCookie = request.cookies.get(NEXT_LOCALE)?.value;

      console.log("[i18nMiddleware] NEXT_LOCALE cookie:", nextLocaleCookie);

      const pathname = request.nextUrl.pathname;
      const localePrefix = Object.values(localePrefixes).find(
        (localePrefix) =>
          pathname.startsWith(localePrefix) || pathname === localePrefix,
      );
      const isLocalePrefixedPathname = !!localePrefix;

      console.log("[i18nMiddleware] Locale prefix found:", localePrefix);
      console.log(
        "[i18nMiddleware] Is locale-prefixed path:",
        isLocalePrefixedPathname,
      );

      let locale = preferredLocale;

      const handleI18nRouting = createIntlMiddleware(routing);
      let response = handleI18nRouting(request);

      if (!response) {
        console.warn(
          "[i18nMiddleware] No response from createIntlMiddleware. Using NextResponse.next().",
        );
        response = NextResponse.next();
      }

      if (isLocalePrefixedPathname) {
        locale =
          Object.keys(localePrefixes).find(
            (key) =>
              localePrefixes[key as Exclude<Locale, typeof DEFAULT_LOCALE>] ===
              localePrefix,
          ) ?? DEFAULT_LOCALE;
      }

      console.log("[i18nMiddleware] Determined locale:", locale);

      if (!SUPPORTED_LOCALES.includes(locale)) {
        console.warn(
          "[i18nMiddleware] Locale not supported. Using default locale:",
          DEFAULT_LOCALE,
        );
        locale = DEFAULT_LOCALE;
      }

      response.cookies.set(NEXT_LOCALE, locale);

      if (locale !== nextLocaleCookie) {
        console.log(
          "[i18nMiddleware] Locale changed. Deleting checkoutId cookie.",
        );

        // Correct way to delete a cookie in Next.js middleware
        response.cookies.set(COOKIE_KEY.checkoutId, "", { maxAge: -1 });
      }

      console.log("[i18nMiddleware] Middleware execution completed.");

      const middlewareResponse = await middleware(request, event, response);

      return middlewareResponse ?? response;
    } catch (error) {
      console.error("[i18nMiddleware] Middleware error:", error);

      return NextResponse.next(); // Ensure failure does not break requests
    }
  };
}
