import * as Sentry from "@sentry/nextjs";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;

    return {
      locale,
      messages,
      onError: (error) => {
        Sentry.captureMessage(error.code, {
          extra: { messages: error.message },
          level: "warning",
        });
      },
    };
  } catch (error) {
    // Fallback in case messages file doesn't exist
    Sentry.captureException(error);

    return {
      locale: routing.defaultLocale,
      messages: (await import(`../../messages/${routing.defaultLocale}.json`))
        .default,
    };
  }
});
