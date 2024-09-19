import { defineRouting } from "next-intl/routing";

import { type Locale, SUPPORTED_LOCALES } from "@/regions/types";

export const localePrefixes: Record<Locale, string> = {
  "en-GB": "/gb",
  "en-US": "/us",
};

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: "en-GB",
  localePrefix: {
    mode: "always",
    prefixes: localePrefixes,
  },
});
