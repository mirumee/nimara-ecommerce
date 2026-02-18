import type { Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { generateStandardSearchMetadata } from "@nimara/features/search/shared/metadata/standard-metadata";
import { StandardSearchView } from "@nimara/features/search/shop-basic-plp/standard";
import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import { handleFiltersFormSubmit } from "./_actions/handle-filters-form-submit";

type SearchPageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata(
  props: SearchPageProps,
): Promise<Metadata> {
  const { q } = await props.searchParams;
  const services = await getServiceRegistry();
  const t = await getTranslations("search");

  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;
  const searchPath = paths.search.asPath();

  return generateStandardSearchMetadata({
    ...props,
    services,
    storefrontUrl,
    searchPath,
    title: q ? t("search-for", { query: q }) : t("all-products"),
    description: t("description"),
    ogImageAlt: t("search-preview"),
  });
}

export default async function Page(props: SearchPageProps) {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  return (
    <StandardSearchView
      {...props}
      region={region}
      services={services}
      paths={{
        home: paths.home.asPath(),
        search: paths.search.asPath(),
        product: (slug) => paths.products.asPath({ slug }),
      }}
      localePrefixes={LOCALE_PREFIXES}
      defaultLocale={DEFAULT_LOCALE}
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
      defaultSortBy={DEFAULT_SORT_BY}
      handleFiltersFormSubmit={handleFiltersFormSubmit}
    />
  );
}
