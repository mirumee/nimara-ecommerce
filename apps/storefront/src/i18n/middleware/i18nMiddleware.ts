import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import type { CustomMiddleware } from "@nimara/foundation/middleware/chain";
import {
  DEFAULT_LOCALE,
  LOCALE_PREFIXES,
  SUPPORTED_LOCALES,
} from "@nimara/i18n/config";
import { routing } from "@nimara/i18n/routing";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { type SupportedLocale } from "@/foundation/regions/types";
import { getStorefrontLogger } from "@/services/lazy-logging";

function getLocale(request: NextRequest): SupportedLocale {
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") || "",
    },
  }).languages();

  const matchedLanguage = match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE);

  if (SUPPORTED_LOCALES.includes(matchedLanguage)) {
    return matchedLanguage;
  }

  // Log a warning if the matched language is not supported
  void getStorefrontLogger().then((logger) => {
    logger.warning(
      `Locale "${matchedLanguage}" is not supported. Falling back to default locale "${DEFAULT_LOCALE}".`,
    );
  });

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

    // INFO: Skip i18n middleware for prefetch requests, bot requests, and OPTIONS requests
    if (isRequestPrefetch || isRequestFromBot || isOptionsRequest) {
      void getStorefrontLogger().then((storefrontLogger) => {
        storefrontLogger.debug(
          `Skipping i18n middleware for request: ${request.method} ${request.url}`,
          {
            isRequestPrefetch,
            isRequestFromBot,
            isOptionsRequest,
          },
        );
      });

      return next(request, event, prevResponse);
    }

    const pathname = request.nextUrl.pathname;
    const isOpenGraphPath = pathname.includes("/opengraph-image");

    // Custom: For 'opengraph-image' paths without locale prefix, rewrite the path
    // internally to include the default locale, avoiding a redirect.
    const hasLocalePrefix = Object.values(LOCALE_PREFIXES).some((prefix) =>
      pathname.startsWith(prefix),
    );
    const isDefaultLocalePath = !hasLocalePrefix; // no prefix means default locale path

    if (isOpenGraphPath && isDefaultLocalePath) {
      // Rewrite the URL internally to the default locale's path
      const url = request.nextUrl.clone();

      url.pathname = `/us${pathname}`;

      const response = NextResponse.rewrite(url);

      return next(request, event, response);
    }

    // INFO: Special handling for opengraph-image paths:
    //       If already locale-prefixed, serve directly and skip next-intl
    if (isOpenGraphPath) {
      return next(request, event, prevResponse);
    }

    const localePrefix = Object.values(LOCALE_PREFIXES).find(
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
        (Object.keys(LOCALE_PREFIXES).find(
          (key) =>
            LOCALE_PREFIXES[
              key as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
            ] === localePrefix,
        ) as SupportedLocale) ?? DEFAULT_LOCALE;
    }

    // INFO: Store the locale in the cookie to know if the locale has changed between requests
    response.cookies.set(COOKIE_KEY.locale, localeFromRequest, {
      maxAge: COOKIE_MAX_AGE.locale,
    });

    const localeFromCookie = request.cookies.get(COOKIE_KEY.locale)?.value;

    if (localeFromCookie && localeFromRequest !== localeFromCookie) {
      void getStorefrontLogger().then((storefrontLogger) => {
        storefrontLogger.debug(
          `Locale changed from ${localeFromCookie} to ${localeFromRequest}. Removing the checkoutId cookie.`,
          {
            requestUrl: request.url,
            nextUrl: request.nextUrl.toString(),
          },
        );
      });

      response.cookies.delete(COOKIE_KEY.checkoutId);
    }

    return next(request, event, response);
  };
}
