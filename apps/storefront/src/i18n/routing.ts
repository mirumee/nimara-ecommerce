import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import {
  DEFAULT_LOCALE,
  type Locale,
  SUPPORTED_LOCALES,
} from "@/regions/types";

export const localePrefixes: Record<
  Exclude<Locale, typeof DEFAULT_LOCALE>,
  string
> = {
  "en-GB": "/gb",
};

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
  localePrefix: {
    mode: "as-needed",
    prefixes: localePrefixes,
  },
});

const { redirect: _redirect } = createNavigation(routing);

// Help TypeScript detect unreachable code
export const redirect: typeof _redirect = _redirect;

export const { Link, usePathname, useRouter } = createNavigation(routing);
