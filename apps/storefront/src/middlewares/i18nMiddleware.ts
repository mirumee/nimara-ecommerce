import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextFetchEvent, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { localePrefixes, routing } from "@/i18n/routing";
import {
  DEFAULT_LOCALE,
  type Locale,
  SUPPORTED_LOCALES,
} from "@/regions/types";
import { storefrontLogger } from "@/services/logging";

import type { CustomMiddleware } from "./chain";

function getLocale(request: NextRequest) {
  const languages = new Negotiator({
    headers: {
      "accept-language":
        request.headers.get("accept-language") ?? DEFAULT_LOCALE,
    },
  }).languages();

  return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);
}

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;
    const localePrefix = Object.values(localePrefixes).find(
      (localePrefix) =>
        pathname.startsWith(localePrefix) || pathname === localePrefix,
    );

    const isLocalePrefixedPathname = !!localePrefix;

    let localeFromRequest = getLocale(request);

    const handleI18nRouting = createIntlMiddleware(routing);
    const response = handleI18nRouting(request);

    // INFO: All routes have locale prefixes except for default locale/domain - "/".
    // If the user types only domain name it should be navigated to preffered region of the store,
    // otherwise navigate to the requested locale prefixed pathname
    if (isLocalePrefixedPathname) {
      localeFromRequest =
        Object.keys(localePrefixes).find(
          (key) =>
            localePrefixes[key as Exclude<Locale, typeof DEFAULT_LOCALE>] ===
            localePrefix,
        ) ?? DEFAULT_LOCALE;
    }

    // INFO: Store the locale in the cookie to know if the locale has changed between requests
    response.cookies.set(COOKIE_KEY.locale, localeFromRequest, {
      maxAge: COOKIE_MAX_AGE.locale,
    });

    const localeFromCookie = request.cookies.get(COOKIE_KEY.locale)?.value;

    if (localeFromCookie && localeFromRequest !== localeFromCookie) {
      storefrontLogger.debug(
        `Locale changed from ${localeFromCookie} to ${localeFromRequest}. Removing the checkoutId cookie.`,
      );

      request.cookies.delete(COOKIE_KEY.checkoutId);
      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    return middleware(request, event, response);
  };
}
