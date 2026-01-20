"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_KEY } from "@/config";
import { DEFAULT_LOCALE } from "@/foundation/regions/config";
import type { SupportedLocale } from "@/foundation/regions/types";
import { localePrefixes } from "@/i18n/routing";

export const handleLocaleChange = async (locale: SupportedLocale) => {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEY.locale, locale);
  cookieStore.delete(COOKIE_KEY.checkoutId);
  revalidatePath("/");

  redirect(
    locale === DEFAULT_LOCALE
      ? "/"
      : localePrefixes[
          locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
        ],
  );
};
