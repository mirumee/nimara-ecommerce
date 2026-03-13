import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { INTL_FORMATS_CONFIG, type SupportedLocale } from "./config";
import { loadMessages } from "./loadMessages";
import { routing } from "./routing";

export interface RequestConfigOptions {
  /**
   * Application identifier used to compose the correct message bundle.
   */
  app: "storefront" | "marketplace";
  /**
   * Optional logger for warning messages.
   */
  logger?: {
    error: (message: string) => void;
    warning: (message: string) => void;
  };
  /**
   * Optional error reporting function for critical errors.
   */
  onCriticalError?: (error: Error) => void;
  /**
   * Optional error reporting function for missing translations.
   */
  onMissingTranslation?: (locale: string) => void;
  /**
   * Optional error handler for next-intl errors.
   */
  onTranslationError?: (error: { code: string; message: string }) => void;
}

export function createRequestConfig(options: RequestConfigOptions) {
  const {
    logger,
    onMissingTranslation,
    onCriticalError,
    onTranslationError,
    app,
  } = options;

  return getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;

    const locale = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale;

    let messages = await getMessages(locale, app);

    if (messages === null) {
      const warningMessage = `Messages for "${requested}" not found. Falling back to "${routing.defaultLocale}". Please ensure the translation file exists.`;

      logger?.warning(warningMessage);
      onMissingTranslation?.(requested ?? "");

      messages = await getMessages(routing.defaultLocale, app);
    }

    if (messages === null) {
      const criticalError = new Error(
        `Default messages for "${routing.defaultLocale}" not found. This indicates a build configuration issue.`,
      );

      logger?.error(criticalError.message);
      onCriticalError?.(criticalError);

      return {
        locale: routing.defaultLocale,
        messages: {}, // Return empty messages to prevent a crash
      };
    }

    return {
      locale,
      messages,
      formats: INTL_FORMATS_CONFIG,
      timeZone: "Europe/London",
      onError: (error) => {
        // This handles errors from next-intl itself, like a missing translation key.
        onTranslationError?.(error);
      },
    };
  });
}

type LoadedMessages = Record<string, unknown>;

async function getMessages(
  locale: string,
  app: "storefront" | "marketplace",
): Promise<LoadedMessages | null> {
  try {
    if (!hasLocale(routing.locales, locale)) {
      return null;
    }

    const typedLocale = locale as SupportedLocale;

    return await loadMessages(typedLocale, app);
  } catch (error) {
    // The import failed, so we return null to signal a fallback is needed.
    return null;
  }
}
