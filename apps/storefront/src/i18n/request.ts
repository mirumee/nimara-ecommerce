import * as Sentry from "@sentry/nextjs";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@nimara/i18n/routing";

import { storefrontLogger } from "@/services/logging";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  let messages = await getMessages(locale);

  if (messages === null) {
    storefrontLogger.warning(
      `Messages for "${requested}" not found. Falling back to "${routing.defaultLocale}". Please ensure the translation file exists.`,
    );
    Sentry.captureMessage(`Missing translation file for: ${requested}`, {
      level: "warning",
    });

    messages = await getMessages(routing.defaultLocale);
  }

  if (messages === null) {
    const criticalError = `Default messages for "${routing.defaultLocale}" not found. This indicates a build configuration issue.`;

    storefrontLogger.error(criticalError);
    Sentry.captureException(new Error(criticalError));

    return {
      locale: routing.defaultLocale,
      messages: {}, // Return empty messages to prevent a crash
    };
  }

  return {
    locale,
    messages,
    onError: (error) => {
      // This handles errors from next-intl itself, like a missing translation key.
      Sentry.captureMessage(error.code, {
        extra: { messages: error.message },
        level: "warning",
      });
    },
  };
});

async function getMessages(
  locale: string,
): Promise<Record<string, string> | null> {
  try {
    // If this specific file doesn't exist at runtime, the import will reject.
    return (await import(`@nimara/i18n/messages/${locale}.json`)).default;
  } catch (error) {
    // The import failed, so we return null to signal a fallback is needed.
    return null;
  }
}
