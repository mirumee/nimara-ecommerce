import * as Sentry from "@sentry/nextjs";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { SUPPORTED_LOCALES } from "@/regions/types";

export default getRequestConfig(async ({ locale }) => {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return notFound();
  }

  const availableLocale = "en-GB";

  return {
    messages: (await import(`../messages/${availableLocale}.json`)).default,
    onError: (error) => {
      Sentry.captureMessage(error.code, {
        extra: { messages: error.message },
        level: "warning",
      });
    },
  };
});
