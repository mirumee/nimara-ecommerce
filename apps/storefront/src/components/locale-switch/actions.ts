"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";

import { COOKIE_KEY } from "@/config";
import { localePrefixes } from "@/i18n/routing";
import { DEFAULT_LOCALE, type Locale } from "@/regions/types";

const NEXT_LOCALE = "NEXT_LOCALE";

const localeSchema = z.object({ locale: z.string() });

export const handleLocaleFormSubmit = async (formData: FormData) => {
  const { locale } = localeSchema.parse(Object.fromEntries(formData));
  const cookieStore = await cookies();

  cookieStore.set(NEXT_LOCALE, locale);
  cookieStore.delete(COOKIE_KEY.checkoutId);
  revalidatePath("/");

  redirect(
    locale === DEFAULT_LOCALE
      ? "/"
      : localePrefixes[locale as Exclude<Locale, typeof DEFAULT_LOCALE>],
  );
};
