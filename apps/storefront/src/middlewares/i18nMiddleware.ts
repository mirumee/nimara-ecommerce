import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
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

function getLocale(request: NextRequest): Locale {
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") || "",
    },
  }).languages();

  const matchedLanguage = match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);

  if (SUPPORTED_LOCALES.includes(matchedLanguage)) {
    return matchedLanguage as Locale;
  }

  storefrontLogger.warning(
    `Locale "${matchedLanguage}" is not supported. Falling back to default locale "${DEFAULT_LOCALE}".`,
  );

  return DEFAULT_LOCALE;
}

export function i18nMiddleware(next: CustomMiddleware): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    prevResponse: NextResponse,
  ) => {
    const isRequestPrefetch = request.headers.get("x-nextjs-prefetch") === "1";
    const isRequestFromBot = request.headers
      .get("user-agent")
      ?.toLowerCase()
      .includes("bot");
    const isOptionsRequest =
      request.method === "OPTIONS" ||
      request.headers.get("x-middleware-preflight") === "1";

    if (isRequestPrefetch || isRequestFromBot || isOptionsRequest) {
      // INFO: Skip i18n middleware for prefetch requests, bot requests, and OPTIONS requests
      storefrontLogger.debug(
        `Skipping i18n middleware for request: ${request.method} ${request.url}`,
        {
          isRequestPrefetch,
          isRequestFromBot,
          isOptionsRequest,
        },
      );

      return next(request, event, prevResponse);
    }

    const pathname = request.nextUrl.pathname;
    const localeFromCookie = request.cookies.get(COOKIE_KEY.locale)?.value as
      | Locale
      | undefined;

    // Redirect to locale from cookie if visiting root
    if (
      pathname === "/" &&
      localeFromCookie &&
      SUPPORTED_LOCALES.includes(localeFromCookie) &&
      localeFromCookie !== DEFAULT_LOCALE
    ) {
      const localePrefix = localePrefixes[localeFromCookie];

      if (localePrefix) {
        storefrontLogger.debug(
          `Redirecting root "/" to locale from cookie: ${localeFromCookie} (${localePrefix})`,
        );

        return NextResponse.redirect(new URL(localePrefix, request.url));
      }
    }

    const localePrefix = Object.values(localePrefixes).find(
      (localePrefix) =>
        pathname.startsWith(localePrefix) || pathname === localePrefix,
    );

    const isLocalePrefixedPathname = !!localePrefix;

    let localeFromRequest = getLocale(request);

    const handleI18nRouting = createIntlMiddleware(routing);
    const response = handleI18nRouting(request);

    // INFO: All routes have locale prefixes except for default locale/domain - "/".
    // If the user types only domain name it should be navigated to preferred region of the store,
    // otherwise navigate to the requested locale prefixed pathname
    if (isLocalePrefixedPathname) {
      localeFromRequest =
        (Object.keys(localePrefixes).find(
          (key) =>
            localePrefixes[key as Exclude<Locale, typeof DEFAULT_LOCALE>] ===
            localePrefix,
        ) as Locale) ?? DEFAULT_LOCALE;
    }

    // INFO: Store the locale in the cookie to know if the locale has changed between requests
    response.cookies.set(COOKIE_KEY.locale, localeFromRequest, {
      maxAge: COOKIE_MAX_AGE.locale,
    });

    const localeFromCookieAgain = request.cookies.get(COOKIE_KEY.locale)?.value;

    if (localeFromCookieAgain && localeFromRequest !== localeFromCookieAgain) {
      storefrontLogger.debug(
        `Locale changed from ${localeFromCookieAgain} to ${localeFromRequest}. Removing the checkoutId cookie.`,
        {
          requestUrl: request.url,
          nextUrl: request.nextUrl.toString(),
        },
      );

      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    return next(request, event, response);
  };
}
