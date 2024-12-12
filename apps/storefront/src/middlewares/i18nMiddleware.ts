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

  return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);
}

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const prefferedLocale = getLocale(request);
    const nextLocaleCookie = request.cookies.get(NEXT_LOCALE)?.value;
    const pathname = request.nextUrl.pathname;
    const localePrefix = Object.values(localePrefixes).find(
      (localePrefix) =>
        pathname.startsWith(localePrefix) || pathname === localePrefix,
    );
    const isLocalePrefixedPathname = !!localePrefix;

    let locale = prefferedLocale;

    const handleI18nRouting = createIntlMiddleware(routing);
    const response = handleI18nRouting(request);

    // INFO: All routes have locale prefixes except for default locale/domain - "/".
    // If the user types only domain name it should be navigated to preffered region of the store,
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
    response.cookies.set(NEXT_LOCALE, locale);

    if (locale !== nextLocaleCookie) {
      request.cookies.delete(COOKIE_KEY.checkoutId);
      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    return middleware(request, event, response);
  };
}
