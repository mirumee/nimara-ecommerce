import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextFetchEvent, NextRequest } from "next/server";
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

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    console.log("[i18nMiddleware] Incoming request:", request.nextUrl.pathname);

    const prefferedLocale = getLocale(request);

    console.log("[i18nMiddleware] Preferred locale:", prefferedLocale);

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

    let locale = prefferedLocale;

    const handleI18nRouting = createIntlMiddleware(routing);
    const response = handleI18nRouting(request);

    if (isLocalePrefixedPathname) {
      locale =
        Object.keys(localePrefixes).find(
          (key) =>
            localePrefixes[key as Exclude<Locale, typeof DEFAULT_LOCALE>] ===
            localePrefix,
        ) ?? DEFAULT_LOCALE;
    }

    console.log("[i18nMiddleware] Determined locale:", locale);

    response.cookies.set(NEXT_LOCALE, locale);

    if (locale !== nextLocaleCookie) {
      console.log(
        "[i18nMiddleware] Locale changed. Deleting checkoutId cookie.",
      );
      request.cookies.delete(COOKIE_KEY.checkoutId);
      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    console.log("[i18nMiddleware] Middleware execution completed.");

    return middleware(request, event, response);
  };
}
