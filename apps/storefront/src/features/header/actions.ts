"use server";

import { getLocale } from "next-intl/server";
import { z } from "zod";

import { redirect } from "@nimara/i18n/routing";

import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

const searchFormSchema = z.object({ query: z.string().default("") });
const maxSearchSuggestions = 15;

export const performSearch = async (formData: FormData) => {
  const parsedFormData = searchFormSchema.parse(Object.fromEntries(formData));
  const locale = await getLocale();

  redirect({
    href: paths.search.asPath({ query: { q: parsedFormData.query } }),
    locale,
  });
};

export const searchProducts = async (
  value: string,
): Promise<{
  results: Array<{ id: string; label: string; slug: string | null }>;
}> => {
  const services = await getServiceRegistry();
  const searchService = await services.getSearchService();
  const result = await searchService.search(
    {
      query: value,
      limit: maxSearchSuggestions,
    },
    {
      languageCode: services.region.language.code,
      channel: services.region.market.channel,
    },
  );

  const products = result.ok ? result.data.results : [];

  return {
    results:
      products.map((result) => ({
        id: result.id,
        label: result.name,
        slug: result.slug,
      })) ?? [],
  };
};
