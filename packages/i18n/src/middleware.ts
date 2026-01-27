/**
 * i18n middleware for Next.js applications using next-intl.
 *
 * This middleware handles:
 * - Locale detection and routing
 * - Cookie management for locale persistence
 * - Special handling for OpenGraph image paths
 * - Skipping middleware for prefetch, bot, and OPTIONS requests
 *
 * The middleware can be configured with custom cookie keys, logging, and
 * additional callbacks for locale changes.
 */
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { type Locale } from "next-intl";
import createIntlMiddleware from "next-intl/middleware";

import {
  DEFAULT_LOCALE,
  LOCALE_PREFIXES,
  type LocalePrefixes,
  LOCALES,
  type SupportedLocale,
} from "./config";
import { routing } from "./routing";
import { type CustomMiddleware, type I18nMiddlewareOptions } from "./types";

function getLocale(
  request: NextRequest,
  logger?: I18nMiddlewareOptions["logger"],
): Locale {
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") || "",
    },
  }).languages();

  const matchedLanguage = match(languages, LOCALES, DEFAULT_LOCALE);

  if (LOCALES.includes(matchedLanguage as Locale)) {
    return matchedLanguage as Locale;
  }

  // Log a warning if the matched language is not supported
  logger?.warning(
    `Locale "${matchedLanguage}" is not supported. Falling back to default locale "${DEFAULT_LOCALE}".`,
  );

  return DEFAULT_LOCALE;
}

export function createI18nMiddleware({
  localeCookieKey = "NEXT_LOCALE",
  checkoutIdCookieKey = "checkoutId",
  localeCookieMaxAge,
  logger,
  onLocaleChange,
}: I18nMiddlewareOptions): (next: CustomMiddleware) => CustomMiddleware {
  return function i18nMiddleware(next: CustomMiddleware): CustomMiddleware {
    return async (
      request: NextRequest,
      event: NextFetchEvent,
      prevResponse: NextResponse,
    ) => {
      const isRequestPrefetch =
        request.headers.get("x-nextjs-prefetch") === "1";
      const isRequestFromBot = request.headers
        .get("user-agent")
        ?.toLowerCase()
        .includes("bot");
      const isOptionsRequest =
        request.method === "OPTIONS" ||
        request.headers.get("x-middleware-preflight") === "1";

      // Skip i18n middleware for prefetch requests, bot requests, and OPTIONS requests
      if (isRequestPrefetch || isRequestFromBot || isOptionsRequest) {
        logger?.debug(
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

      // Special handling for opengraph-image paths:
      // If already locale-prefixed, serve directly and skip next-intl
      if (isOpenGraphPath) {
        return next(request, event, prevResponse);
      }

      const localePrefix = Object.values(LOCALE_PREFIXES).find(
        (localePrefix) =>
          pathname.startsWith(localePrefix) || pathname === localePrefix,
      );

      const isLocalePrefixedPathname = !!localePrefix;

      let localeFromRequest = getLocale(request, logger);

      const handleI18nRouting = createIntlMiddleware(routing);
      const response = handleI18nRouting(request);

      // All routes have locale prefixes except for default locale/domain - "/".
      // If the user types only domain name it should be navigated to preferred region of the store,
      // otherwise navigate to the requested locale prefixed pathname
      if (isLocalePrefixedPathname) {
        localeFromRequest =
          (Object.keys(LOCALE_PREFIXES).find(
            (key) =>
              LOCALE_PREFIXES[key as keyof LocalePrefixes] === localePrefix,
          ) as SupportedLocale) ?? DEFAULT_LOCALE;
      }

      // Store the locale in the cookie to know if the locale has changed between requests
      response.cookies.set(localeCookieKey, localeFromRequest, {
        maxAge: localeCookieMaxAge,
      });

      const localeFromCookie = request.cookies.get(localeCookieKey)?.value;

      if (localeFromCookie && localeFromRequest !== localeFromCookie) {
        logger?.debug(
          `Locale changed from ${localeFromCookie} to ${localeFromRequest}. Removing the checkoutId cookie.`,
          {
            requestUrl: request.url,
            nextUrl: request.nextUrl.toString(),
          },
        );

        onLocaleChange?.(localeFromCookie, localeFromRequest);

        if (checkoutIdCookieKey) {
          response.cookies.delete(checkoutIdCookieKey);
        }
      }

      return next(request, event, response);
    };
  };
}
