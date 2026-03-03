import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

export const getStoreUrl = async () => {
  const locale = await getLocale();
  const domain = `${(await headers()).get("x-forwarded-proto")}://${(
    await headers()
  ).get("x-forwarded-host")}`;

  return locale === DEFAULT_LOCALE
    ? domain
    : `${domain}${LOCALE_PREFIXES[locale]}`;
};

export const getLocalePrefix = async (): Promise<string> => {
  const locale = await getLocale();

  if (locale === DEFAULT_LOCALE) {
    return "";
  }

  return LOCALE_PREFIXES[locale] ?? "";
};

// builds a full URL by joining a relative path to the store base URL avoiding incorrect slash handling.
export const getStoreUrlWithPath = (base: string, path: string): string => {
  const normalizedBase = base.replace(/\/$/, "") + "/";
  const normalizedPath = path.replace(/^\//, "");

  return new URL(normalizedPath, normalizedBase).toString();
};
