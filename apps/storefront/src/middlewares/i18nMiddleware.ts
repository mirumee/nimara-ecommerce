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
import { storefrontLogger } from "@/services/logging";

import type { CustomMiddleware } from "./chain";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

function getLocale(request: NextRequest) {
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? undefined,
    },
  }).languages();

  return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);
}

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const preferredLocale = getLocale(request);
    const localeCookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const pathname = request.nextUrl.pathname;
    const localePrefix = Object.values(localePrefixes).find(
      (localePrefix) =>
        pathname.startsWith(localePrefix) || pathname === localePrefix,
    );
    const isLocalePrefixedPathname = !!localePrefix;

    let locale = preferredLocale;

    const handleI18nRouting = createIntlMiddleware(routing);
    const response = handleI18nRouting(request);

    // INFO: All routes have locale prefixes except for default locale/domain - "/".
    // If the user types only domain name it should be navigated to preferred region of the store,
    // otherwise navigate to the requested locale prefixed pathname
    if (isLocalePrefixedPathname) {
      locale =
        Object.keys(localePrefixes).find(
          (key) =>
            localePrefixes[key as Exclude<Locale, typeof DEFAULT_LOCALE>] ===
            localePrefix,
        ) ?? DEFAULT_LOCALE;
    }

    // INFO: Store the locale in the cookie to know if the locale has changed between requests
    response.cookies.set(LOCALE_COOKIE_NAME, locale);

    if (locale !== localeCookieValue) {
      storefrontLogger.debug(
        "Clearing checkout ID cookie from i18n middleware.",
      );

      request.cookies.delete(COOKIE_KEY.checkoutId);
      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    return middleware(request, event, response);
  };
}
