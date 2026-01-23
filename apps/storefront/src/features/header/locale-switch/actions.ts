"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DEFAULT_LOCALE,
  LOCALE_PREFIXES,
  type SupportedLocale,
} from "@nimara/i18n/config";

import { COOKIE_KEY } from "@/config";

export const handleLocaleChange = async (locale: SupportedLocale) => {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEY.locale, locale);
  cookieStore.delete(COOKIE_KEY.checkoutId);
  revalidatePath("/");

  redirect(
    locale === DEFAULT_LOCALE
      ? "/"
      : LOCALE_PREFIXES[
          locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
        ],
  );
};
