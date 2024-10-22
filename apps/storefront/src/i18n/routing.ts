import { createSharedPathnamesNavigation } from "next-intl/navigation";
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

const { redirect: _redirect } = createSharedPathnamesNavigation(routing);

// Help TypeScript detect unreachable code
export const redirect: typeof _redirect = _redirect;

export const { Link, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
