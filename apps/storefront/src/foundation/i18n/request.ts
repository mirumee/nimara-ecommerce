/**
 * Configures the i18n request handler for the storefront app.
 *
 * This file wraps the shared `createRequestConfig` from `@nimara/i18n/request`
 * and configures it with storefront-specific logging and error reporting:
 * - Uses `storefrontLogger` for warning and error messages
 * - Reports missing translations and errors to Sentry for monitoring
 *
 * This configuration is used by next-intl via the `requestConfig` option in `next.config.js`.
 */
import * as Sentry from "@sentry/nextjs";

import { createRequestConfig } from "@nimara/i18n/request";

import { storefrontLogger } from "@/services/logging";

export default createRequestConfig({
  logger: storefrontLogger,
  onMissingTranslation: (locale) => {
    Sentry.captureMessage(`Missing translation file for: ${locale}`, {
      level: "warning",
    });
  },
  onCriticalError: (error) => {
    Sentry.captureException(error);
  },
  onTranslationError: (error) => {
    Sentry.captureMessage(error.code, {
      extra: { messages: error.message },
      level: "warning",
    });
  },
});
