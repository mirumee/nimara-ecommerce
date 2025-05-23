"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_KEY } from "@/config";
import { localePrefixes } from "@/i18n/routing";
import { DEFAULT_LOCALE, type Locale } from "@/regions/types";

export const handleLocaleChange = async (locale: Locale) => {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEY.locale, locale);
  cookieStore.delete(COOKIE_KEY.checkoutId);
  revalidatePath("/");

  redirect(
    locale === DEFAULT_LOCALE
      ? "/"
      : localePrefixes[locale as Exclude<Locale, typeof DEFAULT_LOCALE>],
  );
};
