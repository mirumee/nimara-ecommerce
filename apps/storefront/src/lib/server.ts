import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { localePrefixes } from "@/i18n/routing";
import { DEFAULT_LOCALE, type Locale } from "@/regions/types";

export const getStoreUrl = async () => {
  const locale = await getLocale();
  const domain = `${(await headers()).get("x-forwarded-proto")}://${(
    await headers()
  ).get("x-forwarded-host")}`;

  return locale === DEFAULT_LOCALE
    ? domain
    : `${domain}${localePrefixes[locale as Exclude<Locale, typeof DEFAULT_LOCALE>]}`;
};

export const getStoreLocale = async (): Promise<string> => {
  const locale = await getLocale();

  if (locale === DEFAULT_LOCALE) {
    return "";
  }

  return localePrefixes[locale as Exclude<Locale, typeof DEFAULT_LOCALE>];
};
