/**
 * i18n middleware configuration for the storefront app.
 *
 * This file wraps the shared `createI18nMiddleware` from `@nimara/i18n/middleware`
 * and configures it with storefront-specific settings:
 * - Cookie keys and max age from storefront config
 * - Storefront logger for debug and warning messages
 * - Callback to handle locale changes (e.g., clearing checkout ID cookie)
 *
 * The middleware handles locale detection, routing, and cookie management for i18n.
 */
import type { CustomMiddleware } from "@nimara/foundation/middleware/chain";
import { createI18nMiddleware } from "@nimara/i18n/middleware";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { getStorefrontLogger } from "@/services/lazy-logging";
import { storefrontLogger } from "@/services/logging";

export const i18nMiddleware: (next: CustomMiddleware) => CustomMiddleware =
  createI18nMiddleware({
    localeCookieKey: COOKIE_KEY.locale,
    checkoutIdCookieKey: COOKIE_KEY.checkoutId,
    localeCookieMaxAge: COOKIE_MAX_AGE.locale,
    logger: storefrontLogger,
    onLocaleChange: (from, to) => {
      void getStorefrontLogger().then((logger) => {
        logger.debug(`Locale changed from ${from} to ${to}`);
      });
    },
  });
