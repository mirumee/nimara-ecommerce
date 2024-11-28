import * as Sentry from "@sentry/nextjs";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const availableLocale = "en-GB";

  return {
    locale,
    messages: (await import(`../../messages/${availableLocale}.json`)).default,
    onError: (error) => {
      Sentry.captureMessage(error.code, {
        extra: { messages: error.message },
        level: "warning",
      });
    },
  };
});
