"use server";

import { getLocale } from "next-intl/server";
import { z } from "zod";

import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const searchFormSchema = z.object({ query: z.string().default("") });

export const performSearch = async (formData: FormData) => {
  const parsedFormData = searchFormSchema.parse(Object.fromEntries(formData));
  const locale = await getLocale();

  redirect({
    href: paths.search.asPath({ query: { q: parsedFormData.query } }),
    locale,
  });
};
