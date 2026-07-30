"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Locale } from "next-intl";

import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { COOKIE_KEY } from "@/config";

export const handleLocaleChange = async (locale: Locale) => {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEY.locale, locale);
  cookieStore.delete(COOKIE_KEY.checkout);

  const targetPath = locale === DEFAULT_LOCALE ? "/" : LOCALE_PREFIXES[locale];

  // Revalidate the locale we are switching *to*, not the current one. Using
  // `revalidateLocalizedPath` here would resolve the outgoing locale, because
  // the request still carries it.
  revalidatePath(targetPath);

  redirect(targetPath);
};
