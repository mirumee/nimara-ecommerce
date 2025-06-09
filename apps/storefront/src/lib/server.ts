import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { localePrefixes } from "@/i18n/routing";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/regions/types";

export const getStoreUrl = async () => {
  const locale = await getLocale();
  const domain = `${(await headers()).get("x-forwarded-proto")}://${(
    await headers()
  ).get("x-forwarded-host")}`;

  return locale === DEFAULT_LOCALE
    ? domain
    : `${domain}${localePrefixes[locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>]}`;
};

export const getStoreLocale = async (): Promise<string> => {
  const locale = await getLocale();

  if (locale === DEFAULT_LOCALE) {
    return "";
  }

  return localePrefixes[
    locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
  ];
};

// builds a full URL by joining a relative path to the store base URL avoiding incorrect slash handling.
export const getStoreUrlWithPath = (base: string, path: string): string => {
  const normalizedBase = base.replace(/\/$/, "") + "/";
  const normalizedPath = path.replace(/^\//, "");

  return new URL(normalizedPath, normalizedBase).toString();
};
