import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, LOCALE_PREFIXES, LOCALES } from "./config";

const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
  localePrefix: {
    mode: "as-needed",
    prefixes: LOCALE_PREFIXES,
  },
});

const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

export type Redirect = typeof redirect;

const redirect_: Redirect = redirect;

export {
  Link as LocalizedLink,
  redirect_ as redirect,
  routing,
  usePathname,
  useRouter,
};
